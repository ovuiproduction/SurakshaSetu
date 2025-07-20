const express = require("express");
const router = express.Router();
const ActionLog = require("../models/ActionLogs");
const Vendor = require("../models/vendor");
const AuditReport = require("../models/AuditReports");
const AuthServerLog = require("../models/AuthServerLog");
const sendMail = require("../utils/sendMail");

router.get("/fetch-logs", async (req, res) => {
  const { vendorId } = req.query;

  if (!vendorId) {
    return res.status(400).json({ message: "vendorId is required." });
  }

  try {
    const logs = await ActionLog.find({ vendorId }).sort({ timestamp: -1 });

    return res.status(200).json({
      message: `Logs for vendor ${vendorId}`,
      count: logs.length,
      logs,
    });
  } catch (err) {
    console.error("Error fetching logs:", err.message);
    return res.status(500).json({ message: "Failed to fetch logs." });
  }
});

router.get("/fetch-vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find({});
    return res.status(200).json({
      vendors,
    });
  } catch (err) {
    console.error("Error fetching vendors:", err.message);
    return res.status(500).json({ message: "Failed to fetch vendors." });
  }
});

router.put("/audit/save-report", async (req, res) => {
  const { logs, vendorId, vendorName, report, vendorEmail } = req.body;

  try {
    if (!logs || !vendorId || !vendorName || !report) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Extract log IDs from the logs array
    const logIds = logs.map((log) => log._id || log.id);

    // Determine time range
    const timestamps = logs.map((log) => new Date(log.timestamp).getTime());
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
          end: endTime,
        },
      },
    });

    const savedReport = await newReport.save();

    const to = vendorEmail;
    const subject = "Audit Report";
    const body = report;
    sendMail(to, subject, body);

    return res.status(201).json({
      message: "Audit report saved successfully",
      reportId: savedReport._id,
    });
  } catch (err) {
    console.error("Error saving audit report:", err.message);
    return res.status(500).json({
      message: "Failed to save audit report",
      error: err.message,
    });
  }
});

// Get all audit reports (with pagination)
router.get("/audit/fetch-all-reports", async (req, res) => {
  try {
    const reports = await AuditReport.find({});
    return res.status(200).json({
      message: "Audit reports fetched successfully",
      data: reports,
    });
  } catch (err) {
    console.error("Error fetching audit reports:", err.message);
    return res.status(500).json({
      message: "Failed to fetch audit reports",
      error: err.message,
    });
  }
});

// Get reports for specific vendor
router.get("/audit/fetch-reports", async (req, res) => {
  const { vendorId } = req.query;

  try {
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    const query = { vendorId };

    const reports = await AuditReport.find(query).sort({ timestamps: -1 });
    return res.status(200).json({
      message: "Vendor audit reports fetched successfully",
      data: reports,
    });
  } catch (err) {
    console.error("Error fetching vendor audit reports:", err.message);
    return res.status(500).json({
      message: "Failed to fetch vendor audit reports",
      error: err.message,
    });
  }
});

router.get("/system-logs/authorization-server", async (req, res) => {
  try {
    const logs = await AuthServerLog.find()
      .sort({ timestamp: -1 }) // Show newest first
      .limit(100); // Limit logs for performance

    return res.status(200).json({ logs });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch authorization server logs",
      error: err,
    });
  }
});

module.exports = router;
