const express = require('express');
const router = express.Router();
const ActionLog = require('../models/ActionLogs');
const Vendor = require("../models/vendor");
const AuditReport = require("../models/AuditReports");
const AuthServerLog = require("../models/AuthServerLog");
const fs = require('fs');
const path = require('path');

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

router.post('/audit/save-report', async (req, res) => {
  const { logs, vendorId, vendorName, report } = req.body;
  
  try {
    if (!logs || !vendorId || !vendorName || !report) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Extract log IDs from the logs array
    const logIds = logs.map(log => log._id || log.id);
    
    // Determine time range
    const timestamps = logs.map(log => new Date(log.timestamp).getTime());
    const startTime = new Date(Math.min(...timestamps));
    const endTime = new Date(Math.max(...timestamps));

    const newReport = new AuditReport({
      vendorId,
      vendorName,
      logIds,
      report,
      metadata: {
        logCount: logs.length,
        timeRange: {
          start: startTime,
          end: endTime
        }
      }
    });

    const savedReport = await newReport.save();
    
    res.status(201).json({
      message: 'Audit report saved successfully',
      reportId: savedReport._id
    });
    
  } catch (err) {
    console.error('Error saving audit report:', err.message);
    res.status(500).json({ 
      message: 'Failed to save audit report',
      error: err.message 
    });
  }
});

// Get all audit reports (with pagination)
router.get('/audit/fetch-reports', async (req, res) => {
  try {
    const reports = await AuditReport.find({});
    res.status(200).json({
      message: 'Audit reports fetched successfully',
      data: reports
    });
    
  } catch (err) {
    console.error('Error fetching audit reports:', err.message);
    res.status(500).json({ 
      message: 'Failed to fetch audit reports',
      error: err.message 
    });
  }
});

// Get reports for specific vendor
router.post('/audit/fetch-report', async (req, res) => {
  const { vendorId, timeRange } = req.body;
  
  try {
    if (!vendorId) {
      return res.status(400).json({ message: 'Vendor ID is required' });
    }

    const query = { vendorId };
    
    // Add time range filter if provided
    if (timeRange && (timeRange.start || timeRange.end)) {
      query['metadata.timeRange'] = {};
      
      if (timeRange.start) {
        query['metadata.timeRange'].$gte = new Date(timeRange.start);
      }
      
      if (timeRange.end) {
        query['metadata.timeRange'].$lte = new Date(timeRange.end);
      }
    }

    const reports = await AuditReport.find(query)
      .sort({ createdAt: -1 })
      .populate('vendorId', 'orgName clientId')
      .lean();
    
    res.status(200).json({
      message: 'Vendor audit reports fetched successfully',
      data: reports
    });
    
  } catch (err) {
    console.error('Error fetching vendor audit reports:', err.message);
    res.status(500).json({ 
      message: 'Failed to fetch vendor audit reports',
      error: err.message 
    });
  }
});


router.get('/system-logs/authorization-server', async (req, res) => {
  try {
    const logs = await AuthServerLog.find()
      .sort({ createdAt: -1 }) // Show newest first
      .limit(100);             // Limit logs for performance

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch authorization server logs', error: err });
  }
});

module.exports = router;
