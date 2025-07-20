const express = require("express");
const fs = require("fs");
const path = require('path');
const GatewayServerLog = require("../models/GatewayServerLog");

const router = express.Router();

router.get('/system-logs/apigateway-server', async (req, res) => {
  try {
    const logs = await GatewayServerLog.find()
      .sort({ createdAt: -1 })  // latest logs first
      .limit(100);              // limit for performance

    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch logs', error: err });
  }
});

module.exports = router;