const express = require("express");
const jwt = require("jsonwebtoken");
const Vendor = require("../models/vendor");
const ConsentRequest = require("../models/consentRequest");
require("dotenv").config();
const router = express.Router();
const rateLimit = require("express-rate-limit");
const IssuedToken = require("../models/IssuedToken");
const logEvent = require("../utils/logEvent");
const ms = require("ms");

const tokenLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each client/IP to 5 requests per windowMs
  message: "Too many token requests. Please try again later.",
});

const tokenHandler = async (req, res) => {
  const { clientId, clientSecret, userId, scope, purpose, consentId } =
    req.body;

  // Step 1: Validate input presence
  if (
    !clientId ||
    !clientSecret ||
    !userId ||
    !scope ||
    !purpose ||
    !consentId
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Step 2: Validate Vendor Identity
    const vendor = await Vendor.findOne({ clientId, clientSecret });
    if (!vendor) {
      const msg = "Invalid vendor credentials";
      await logEvent({
        vendorId: clientId,
        userId: userId,
        actionType: "token_requested",
        consentId: consentId,
        request: req,
        responseMeta: {
          statusCode: 401,
          status: "failed",
          message: msg,
        },
      });
      return res.status(401).json({ message: msg });
    }

    // Step 3: Fetch and Validate Consent
    const consent = await ConsentRequest.findOne({ _id: consentId });

    if (!consent) {
      const msg = "Consent not found";
      await logEvent({
        vendorId: clientId,
        userId: userId,
        actionType: "token_requested",
        consentId: consentId,
        request: req,
        responseMeta: {
          statusCode: 404,
          status: "failed",
          message: msg,
        },
      });
      return res.status(404).json({ message: msg });
    }

    if (consent.userId !== userId) {
      const msg = "User ID does not match consent record";
      await logEvent({
        vendorId: clientId,
        userId: userId,
        actionType: "token_requested",
        consentId: consentId,
        request: req,
        responseMeta: {
          statusCode: 403,
          status: "failed",
          message: msg,
        },
      });
      return res.status(403).json({ message: msg });
    }

    if (consent.status !== "approved") {
      const msg = `Consent is not approved (status: ${consent.status})`;
      await logEvent({
        vendorId: clientId,
        userId: userId,
        actionType: "token_requested",
        consentId: consentId,
        request: req,
        responseMeta: {
          statusCode: 403,
          status: "failed",
          message: msg,
        },
      });
      return res.status(403).json({
        message: msg,
      });
    }

    if (new Date(consent.expiresAt) < new Date()) {
      const msg = `Consent expired on ${new Date(
        consent.expiresAt
      ).toLocaleString()}`;
      await logEvent({
        vendorId: clientId,
        userId: userId,
        actionType: "token_requested",
        consentId: consentId,
        request: req,
        responseMeta: {
          statusCode: 403,
          status: "failed",
          message: msg,
        },
      });
      return res.status(403).json({
        message: msg,
      });
    }

    // Step 4: Validate Requested Scope ⊆ Consent Scope
    const notInUserApproved = scope.filter(
      (s) => !consent.userApprovedScope.includes(s)
    );
    if (notInUserApproved.length > 0) {
      const msg =
        "Requested scopes not approved by user: " +
        notInUserApproved.join(", ");
      await logEvent({
        vendorId: clientId,
        userId: userId,
        actionType: "token_requested",
        consentId: consentId,
        request: req,
        responseMeta: {
          statusCode: 403,
          status: "failed",
          message: msg,
        },
      });
      return res.status(403).json({
        message: msg,
      });
    }

    // Step 5: Validate Requested Scope ⊆ Vendor Registered Scope
    const notInVendorAllowed = scope.filter(
      (s) => !vendor.dataFields.includes(s)
    );
    if (notInVendorAllowed.length > 0) {
      const msg =
        "Requested scopes not registered by vendor: " +
        notInVendorAllowed.join(", ");
      await logEvent({
        vendorId: clientId,
        userId: userId,
        actionType: "token_requested",
        consentId: consentId,
        request: req,
        responseMeta: {
          statusCode: 403,
          status: "failed",
          message: msg,
        },
      });
      return res.status(403).json({
        message: msg,
      });
    }

    // Optional: Validate purpose if needed
    if (vendor.purpose !== purpose) {
      const msg = "Purpose mismatch with vendor registration";
      await logEvent({
        vendorId: clientId,
        userId: userId,
        actionType: "token_requested",
        consentId: consentId,
        request: req,
        responseMeta: {
          statusCode: 403,
          status: "failed",
          message: msg,
        },
      });
      return res.status(403).json({ message: msg });
    }

    // Step 6: Create Signed JWT Token
    const payload = {
      iss: "AuthSecure",
      sub: userId,
      aud: "DataGateway",
      clientId,
      scope,
      purpose,
      consentId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "10m",
    });

    const savedToken = await IssuedToken.create({
      token,
      clientId,
      userId,
      consentId,
      scope,
      purpose,
      expiresAt: new Date(Date.now() + ms(process.env.JWT_EXPIRE)),
    });

    const msg = "Token Issued and Saved.";
    await logEvent({
      vendorId: clientId,
      userId: userId,
      actionType: "token_issued",
      tokenId: savedToken._id,
      consentId: consentId,
      request: req,
      responseMeta: {
        statusCode: 200,
        status: "success",
        message: msg,
      },
    });
    // Step 7: Return token
    return res.status(200).json({ message: msg, token });
  } catch (err) {
    return res.status(500).json({ message: `Token issuance failed : ${err}` });
  }
};

router.post("/request-token", tokenLimiter, tokenHandler);

module.exports = router;
