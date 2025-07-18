const express = require('express');
const router = express.Router();
const ActionLog = require('../models/ActionLogs');
const Vendor = require("../models/vendor");

router.post('/fetch-logs', async (req, res) => {
  const { vendorId } = req.body;

  if (!vendorId) {
    return res.status(400).json({ message: 'vendorId is required.' });
  }

  try {
    const logs = await ActionLog.find({ vendorId }).sort({ timestamp: -1 });

    res.json({
      message: `Logs for vendor ${vendorId}`,
      count: logs.length,
      logs,
    });
  } catch (err) {
    console.error('Error fetching logs:', err.message);
    res.status(500).json({ message: 'Failed to fetch logs.' });
  }
});

router.get('/fetch-vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find({});
    res.json({
      vendors,
    });
  } catch (err) {
    console.error('Error fetching vendors:', err.message);
    res.status(500).json({ message: 'Failed to fetch vendors.' });
  }
});

module.exports = router;
