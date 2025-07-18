const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const dotenv = require("dotenv");
const crypto = require("crypto");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

dotenv.config();

const logEvent = require("../utils/logEvent");

const router = express.Router();

// ✅ Rate limiter per clientId
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    // Use clientId if authenticated user exists
    if (req.user?.clientId) {
      return req.user.clientId;
    }
    // Fall back to properly generated IP key
    return ipKeyGenerator(req);
  },
  message: "API rate limit exceeded. Try again later.",
});

// ✅ Middleware to authenticate JWT
const authenticateJWT = async (req, res, next) => {
  console.log("data request jwtauth");
  const authHeader = req.headers.authorization;
  const { tokenId, userId, clientId, consentId } = req.body;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request object
    next(); // Move to next middleware
  } catch (err) {
    const msg = "Invalid or expired token";
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
};

// ✅ Actual route handler
router.post("/get-user-data", authenticateJWT, apiLimiter, async (req, res) => {
  const { clientId, sub: userId, scope, purpose, consentId } = req.user;
  const { tokenId } = req.body;

  try {
    const consentApprovalResponse = await axios.post(
      `http://localhost:${process.env.AUTH_SERVER_PORT}/api/consent/verify-status`,
      { consentId }, // No body needed in this case
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );

    if (
      consentApprovalResponse.status != 200 ||
      !consentApprovalResponse.data.status
    ) {
      const msg = consentApprovalResponse.data.message;
      await logEvent({
        vendorId: clientId,
        userId: userId,
        actionType: "data_requested",
        tokenId: tokenId,
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

    try {
      const response = await axios.post(
        `http://localhost:${process.env.BANK_SERVER_PORT}/api/data-req/get-data`,
        { userId, scope },
        { headers: { "Content-Type": "application/json" } }
      );

      const payload = {
        userId,
        clientId,
        consentId,
        purpose,
        fields: scope,
        data: response.data,
        issuedAt: Date.now(),
      };

      const privateKey = fs.readFileSync("gateway_private.pem", "utf-8");
      const sign = crypto.createSign("SHA256");
      sign.update(JSON.stringify(payload));
      sign.end();
      const signature = sign.sign(privateKey, "base64");

      const msg = "Data successfully feteched from bank by api gateway";
      await logEvent({
        vendorId: clientId,
        userId: userId,
        actionType: "data_requested",
        tokenId: tokenId,
        consentId: consentId,
        request: req,
        responseMeta: {
          statusCode: 200,
          status: "success",
          message: msg,
        },
      });
      return res.status(200).json({ payload, signature });
    } catch (err) {
      let message = "";
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else {
        message = err.message;
      }
      const msg = "(API Gateway) Failed to retrieve data : " + message;
      await logEvent({
        vendorId: clientId,
        userId: userId,
        actionType: "data_requested",
        tokenId: tokenId,
        consentId: consentId,
        request: req,
        responseMeta: {
          statusCode: 500,
          status: "failed",
          message: msg,
        },
      });
      return res.status(500).json({ message: message });
    }
  } catch (err) {
    let message = "";
    if (err.response && err.response.data && err.response.data.message) {
      message = err.response.data.message;
    } else {
      message = err.message;
    }
    return res.status(500).json({ message: message });
  }
});

module.exports = router;
