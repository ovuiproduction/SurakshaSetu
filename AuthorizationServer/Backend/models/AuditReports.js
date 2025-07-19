const mongoose = require("mongoose");

const AuditReportSchema = new mongoose.Schema({
  vendorId: {
    type:String,
    required: true,
  },
  vendorName: {
    type: String,
    required: true,
  },
  logIds: {  // Reference to original logs instead of duplicating
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Log",  // Assuming you have a Log model
    required: true
  },
  report: {
    type: String,
    required: true,
  },
  metadata: {
    logCount: {
      type: Number,
      default: 0
    },
    timeRange: {
      start: Date,
      end: Date
    }
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
AuditReportSchema.index({ vendorId: 1 });
AuditReportSchema.index({ createdAt: -1 });
AuditReportSchema.index({ "metadata.timeRange.start": 1 });

module.exports = mongoose.model("AuditReport", AuditReportSchema);