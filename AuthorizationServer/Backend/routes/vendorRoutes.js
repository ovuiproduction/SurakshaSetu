const express = require("express");
const router = express.Router();
const crypto = require("crypto");
require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const nodemailer = require("nodemailer");

const logEvent = require("../utils/logEvent");

const CallbackLog = require("../models/CallbackLog");
const IssuedToken = require("../models/IssuedToken");
const ConsentRequest = require("../models/consentRequest");
const Vendor = require("../models/vendor");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register Vendor
router.post("/register", async (req, res) => {
  try {
    const {
      orgName,
      email,
      phone,
      contactPerson,
      purpose,
      callbackUrl,
      dataFields,
    } = req.body;

    const clientId = crypto.randomBytes(12).toString("hex");
    const clientSecret = crypto.randomBytes(24).toString("hex");

    const newVendor = new Vendor({
      orgName,
      email,
      phone,
      contactPerson,
      purpose,
      callbackUrl,
      dataFields,
      clientId,
      clientSecret,
    });

    await newVendor.save();

    return res.status(201).json({
      message: "Vendor registered successfully!",
      clientId,
      clientSecret,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Registration failed.", error: err });
  }
});

// Request OTP
router.post("/request-otp", async (req, res) => {
  const { email } = req.body;

  const vendor = await Vendor.findOne({ email });
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 5 * 60000); // 5 min expiry

  vendor.otp = otp;
  vendor.otpExpiry = expiry;
  await vendor.save();

  // Send OTP via email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Login",
    text: `Your OTP is: ${otp}`,
  });

  return res.json({ message: "OTP sent to your email" });
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const vendor = await Vendor.findOne({ email });
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  if (vendor.otp !== otp || new Date() > vendor.otpExpiry) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // Clear OTP after use
  vendor.otp = null;
  vendor.otpExpiry = null;
  await vendor.save();

  return res.status(200).json({
    message: "Login success",
    vendor: {
      orgName: vendor.orgName,
      clientId: vendor.clientId,
      clientSecret: vendor.clientSecret,
      email: vendor.email,
      dataFields: vendor.dataFields,
      purpose: vendor.purpose,
      callbackUrl: vendor.callbackUrl,
    },
  });
});

router.get("/verify-session", async (req, res) => {
  try {
    // Get authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Missing credentials" });
    }

    const clientSecret = authHeader.split(" ")[1];

    // Verify the client secret exists in database
    const vendor = await Vendor.findOne({ clientSecret });
    if (!vendor) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid credentials" });
    }

    // If we get here, verification is successful
    return res.status(200).json({
      verified: true,
      vendor: vendor,
    });
  } catch (err) {
    console.error("Session verification error:", err);
    return res.status(500).json({ message: "Server error during verification" });
  }
});

router.post("/consent/callback", async (req, res) => {
  try {
    const {
      clientId,
      consentId,
      userId,
      status,
      scope,
      purpose,
      approvedAt,
      expiresAt,
    } = req.body;

    // ✅ Fetch the vendor using clientId
    const vendor = await Vendor.findOne({ clientId });
    if (!vendor) {
      return res.status(400).json({ message: "Invalid clientId" });
    }

    // ✅ Confirm consent exists
    const consent = await ConsentRequest.findById(consentId);
    if (!consent) {
      return res.status(400).json({ message: "Invalid consentId" });
    }

    // ✅ Save the callback log
    const callbackLog = new CallbackLog({
      consentId,
      clientId: vendor.clientId,
      callbackUrl: req.originalUrl,
      requestPayload: {
        clientSecret: vendor.clientSecret,
        clientId,
        consentId,
        userId,
        status,
        scope,
        purpose,
        approvedAt,
        expiresAt,
      },
      responseStatus: 200, // assuming callback POST is acknowledged
      responseBody: { message: "Callback received successfully" },
      status: "success",
      manualMode: true,
    });

    await callbackLog.save();

    return res.status(200).json({ message: "Callback logged successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Callback error: ${error}` });
  }
});

router.post("/vendor/apigateway/data-req", async (req, res) => {
  let { jwtToken, tokenId, userId, clientId, consentId } = req.body;
   console.log("ok");
  try {
    const gatewayResponse = await axios.post(
      `http://localhost:${process.env.GATEWAY_SERVER_PORT}/api/gateway/get-user-data`,
      { tokenId, userId, clientId, consentId }, // No body needed in this case
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    if (gatewayResponse.status == 200) {
      const { payload, signature } = gatewayResponse.data;
      const publicKey = fs.readFileSync("gateway_public.pem", "utf-8");

      const verify = crypto.createVerify("SHA256");
      verify.update(JSON.stringify(payload));
      verify.end();

      const isVerified = verify.verify(publicKey, signature, "base64");
       console.log(isVerified);
      if (!isVerified) {
        const msg = "Signature verification failed. Untrusted data.";
        await logEvent({
          vendorId: clientId,
          userId: userId,
          actionType: "data_requested",
          tokenId: tokenId,
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

      let { userId, clientId, consentId, purpose, fields, data } = payload;

      try {
        const storeResponse = await axios.put(
          `http://localhost:${process.env.PORT}/api/vendor-data/store-fetched-data`,
          {
            clientId: clientId, // from your vendor object
            userId: userId, // assume returned from gateway
            consentId: consentId,
            purpose: purpose,
            fields: fields, // or actual fields received
            data: data, // or fetchedData.data depending on shape
          }
        );
        if (storeResponse.status == 201) {
          const msg = "Data sent to vendor successfully.";
          await logEvent({
            vendorId: clientId,
            userId: userId,
            actionType: "data_sent",
            tokenId: tokenId,
            consentId: consentId,
            request: req,
            responseMeta: {
              statusCode: 200,
              status: "success",
              message: msg,
            },
          });
          return res.status(200).json({
            message: "Callback sucessfull. Data Sent succesfully.",
          });
        }
      } catch (err) {
        let message = "";
        if (err.response && err.response.data && err.response.data.message) {
          message = err.response.data.message;
        } else {
          message = err.message;
        }
        return res.status(500).json({
          message: `Error Storing fetched data : ${message}`,
        });
      }
    }
    // store
  } catch (err) {
    let message = "";
    if (err.response && err.response.data && err.response.data.message) {
      message = err.response.data.message;
    } else {
      message = err.message;
    }
    return res.status(401).json({
      message: `Error fetching data from API Gateway : ${message}`,
    });
  }
});

router.get("/vendor/fetch-callbacks", async (req, res) => {
  try {
    const { clientId } = req.query; // Assuming vendor ID is available here after authentication

    const callbacks = await CallbackLog.find({ clientId })
      .populate("consentId", "purpose scope status") // optional: populate consent data
      .sort({ sentAt: -1 }); // recent first

    return res.status(200).json({ success: true, callbacks });
  } catch (err) {
    console.error("Error fetching callbacks:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching callback logs" });
  }
});

router.get("/vendor/fetch-tokens", async (req, res) => {
  try {
    const { clientId } = req.query;
    const tokens = await IssuedToken.find({ clientId }).sort({ issuedAt: -1 }); // recent first
    return res.status(200).json({ success: true, tokens });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Server error fetching callback logs : ${err.message}`,
    });
  }
});

module.exports = router;
