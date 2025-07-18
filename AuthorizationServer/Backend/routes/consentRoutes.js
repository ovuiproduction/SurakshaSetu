const express = require("express");
const router = express.Router();
const ConsentRequest = require("../models/consentRequest");
const Vendor = require("../models/vendor");
require("dotenv").config();
const axios = require("axios");
const logEvent = require("../utils/logEvent");


router.post("/initiate", async (req, res) => {
  const { userId, clientId, clientSecret, scope, purpose, callbackUrl } =
    req.body;

  // Verify vendor credentials
  const vendor = await Vendor.findOne({ clientId });
  if (!vendor || vendor.clientSecret !== clientSecret) {
    await logEvent({
      vendorId: clientId,
      userId,
      actionType: "consent_initiated",
      request: req,
      responseMeta: {
        statusCode: 404,
        status: "unauthorized",
        message: "Vendor not authorized",
      },
    });
    return res.status(404).json({ message: "Vendor not authorized." });
  }

  if (vendor.purpose !== purpose) {
    await logEvent({
      vendorId: clientId,
      userId,
      actionType: "consent_initiated",
      request: req,
      responseMeta: {
        statusCode: 403,
        status: "unauthorized",
        message: "Purpose mismatch with vendor registration",
      },
    });
    return res
      .status(403)
      .json({ message: "Purpose mismatch with vendor registration" });
  }

  const notInVendorAllowed = scope.filter(
    (s) => !vendor.dataFields.includes(s)
  );
  if (notInVendorAllowed.length > 0) {
    const msg = `Requested scopes not registered by vendor: ${notInVendorAllowed.join(
      ", "
    )}`;

    await logEvent({
      vendorId: clientId,
      userId,
      actionType: "consent_initiated",
      request: req,
      responseMeta: {
        statusCode: 403,
        status: "unauthorized",
        message: msg,
      },
    });
    return res.status(403).json({
      message: msg,
    });
  }

  try {
    // 1. Check for existing valid consent (pending or approved)
    const existingConsent = await ConsentRequest.findOne({
      userId,
      clientId,
      purpose,
      scope: { $all: scope },
      status: { $in: ["pending", "approved"] },
    });

    if (existingConsent) {
      // Optional: check if it's expired too
      if (
        existingConsent.expiresAt &&
        new Date(existingConsent.expiresAt) < new Date()
      ) {
        existingConsent.status = "expired";
        await existingConsent.save();
      } else {
        const msg = "Consent already initiated.";
        await logEvent({
          vendorId: clientId,
          userId,
          consentId: existingConsent.consentId,
          actionType: "consent_initiated",
          request: req,
          responseMeta: {
            statusCode: 200,
            status: "success",
            message: msg,
          },
        });
        return res.status(200).json({
          message: msg,
          consentId: existingConsent.consentId,
        });
      }
    }

    // 2. Verify user from bank
    const response = await axios.post(
      `http://localhost:${process.env.BANK_SERVER_PORT}/api/user/verify-user`,
      { userId },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200) {
      if (response.status == 404) {
        const msg = `User verification failed: ${response.data.message}`;
        await logEvent({
          vendorId: clientId,
          userId,
          actionType: "consent_initiated",
          request: req,
          responseMeta: {
            statusCode: 404,
            status: "failed",
            message: msg,
          },
        });
        return res.status(404).json({
          message: msg,
        });
      }
      const msg = `User verification failed: ${response.data.message}`;
      await logEvent({
        vendorId: clientId,
        userId,
        actionType: "consent_initiated",
        request: req,
        responseMeta: {
          statusCode: 500,
          status: "failed",
          message: msg,
        },
      });
      return res.status(500).json({
        message: msg,
      });
    }

    const user = response.data.user;
    const contact = user.email;
    const consentId = "consent_" + Math.random().toString(36).substr(2, 8);

    // 3. Save new consent
    const consent = new ConsentRequest({
      consentId,
      userId,
      contact,
      orgName: vendor.orgName,
      clientId,
      purpose,
      scope,
      callbackUrl,
      status: "pending",
      createdAt: new Date(),
    });

    await consent.save();
    const msg = `Consent initiated successfully.`;
    await logEvent({
      vendorId: clientId,
      userId,
      actionType: "consent_initiated",
      consentId: consentId,
      request: req,
      responseMeta: {
        statusCode: 200,
        status: "success",
        message: msg,
      },
    });
    res.status(200).json({ message: "Consent initiated.", consentId });
  } catch (err) {
    console.error("Consent initiation error:", err.message);
    res.status(500).json({ message: "Consent request failed." });
  }
});

router.post("/approve-consent", async (req, res) => {
  try {
    const { consentId, scope, expiresInDays } = req.body;

    const consent = await ConsentRequest.findById(consentId);
    if (!consent) {
      return res.status(404).json({ message: "Consent request not found" });
    }

    // Update fields
    const approvedAt = new Date();
    const expiresAt = new Date(
      approvedAt.getTime() + expiresInDays * 24 * 60 * 60 * 1000
    );

    consent.status = "approved";
    consent.userApprovedScope = scope || consent.scope;
    consent.approvedAt = approvedAt;
    consent.expiresAt = expiresAt;

    await consent.save();

    // Notify vendor via callback
    if (consent.callbackUrl) {
      try {
        await axios.post(consent.callbackUrl, {
          clientId: consent.clientId,
          consentId: consent._id,
          userId: consent.userId,
          status: consent.status,
          scope: consent.userApprovedScope,
          purpose: consent.purpose,
          approvedAt,
          expiresAt,
        });
      } catch (callbackErr) {
        res.status(500).json({ message: callbackErr.message });
      }
    }

    const msg = `Consent approved & Callback Successfully.`;
    await logEvent({
      vendorId: consent.clientId,
      userId: consent.userId,
      actionType: "consent_approved",
      consentId: consentId,
      request: req,
      responseMeta: {
        statusCode: 200,
        status: "success",
        message: msg,
      },
    });
    res.status(200).json({ message: "Consent approved and vendor notified" });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error approving consent : ${err.message}` });
  }
});

router.post("/reject-consent", async (req, res) => {
  try {
    const { consentId } = req.body;

    const consent = await ConsentRequest.findById(consentId);
    if (!consent) {
      return res.status(404).json({ message: "Consent request not found" });
    }

    consent.status = "rejected";

    await consent.save();

    if (consent.callbackUrl) {
      try {
        await axios.post(consent.callbackUrl, {
          clientId: consent.clientId,
          consentId: consent._id,
          userId: consent.userId,
          status: consent.status,
          scope: consent.userApprovedScope,
          purpose: consent.purpose,
          approvedAt,
          expiresAt,
        });
      } catch (callbackErr) {
        res.status(500).json({ message: callbackErr });
      }
    }

    const msg = `Consent Rejected & Callback Successfully.`;
    await logEvent({
      vendorId: consent.clientId,
      userId: consent.userId,
      consentId: consentId,
      actionType: "consent_rejected",
      request: req,
      responseMeta: {
        statusCode: 200,
        status: "success",
        message: msg,
      },
    });
    res.status(200).json({ message: "Consent rejected and vendor notified" });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error approving consent : ${err.message}` });
  }
});

router.post("/revoke", async (req, res) => {
  try {
    const { consentId } = req.body;

    const consent = await ConsentRequest.findById(consentId);
    if (!consent) {
      return res.status(404).json({ message: "Consent not found" });
    }

    if (consent.status === "revoked") {
      return res.status(400).json({ message: "Consent is already revoked" });
    }

    consent.status = "revoked";
    consent.revokedAt = new Date(); // optional, add to schema if needed
    await consent.save();

    // Optional: Notify vendor of revocation
    if (consent.callbackUrl) {
      try {
        await axios.post(consent.callbackUrl, {
          consentId: consent._id,
          userId: consent.userId,
          status: "revoked",
          revokedAt: consent.revokedAt,
        });
      } catch (err) {
        res
          .status(500)
          .json({ message: `Failed to notify vendor: ${err.message}` });
      }
    }

    const msg = `Consent revoked & Callback Successfully.`;
    await logEvent({
      vendorId: consent.clientId,
      userId: consent.userId,
      actionType: "consent_revoked",
      consentId: consentId,
      request: req,
      responseMeta: {
        statusCode: 200,
        status: "success",
        message: msg,
      },
    });

    res.status(200).json({ message: "Consent successfully revoked" });
  } catch (err) {
    res.status(500).json({ message: `Error revoking consent: ${err.message}` });
  }
});

router.post("/get-consent-data", async (req, res) => {
  const { userId } = req.body;
  const consentList = await ConsentRequest.find({ userId: userId });
  res.status(200).json({ consentList });
});

router.post("/get-vendor-history", async (req, res) => {
  const { clientId } = req.body;
  const consentList = await ConsentRequest.find({ clientId: clientId });
  res.status(200).json({ consentList });
});

router.post("/verify-status", async (req, res) => {
  const { consentId } = req.body;
  const consent = await ConsentRequest.findOne({ _id: consentId });

  if (!consent) {
    return res.status(404).json({ msg: "Consent not found", status: false });
  }

  if (consent.status !== "approved") {
    return res.status(403).json({
      message: `Consent is not approved (status: ${consent.status})`,
      status: false,
    });
  }

  if (new Date(consent.expiresAt) < new Date()) {
    return res.status(403).json({
      message: `Consent expired on ${new Date(
        consent.expiresAt
      ).toLocaleString()}`,
      status: false,
    });
  }

  res
    .status(200)
    .json({ message: "Consent is valid & approved", status: true });
});

module.exports = router;
