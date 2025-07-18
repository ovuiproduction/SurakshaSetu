// models/VendorActionLog.js
const mongoose = require('mongoose');

const ActionLogSchema = new mongoose.Schema({
  vendorId: { type: String, required: true },
  userId: { type: String, default: null },
  consentId: { type: String, default: null },
  tokenId: { type: String, default: null },

  actionType: {
    type: String,
    enum: [
      'consent_initiated',
      'consent_approved',
      'consent_rejected',
      'consent_revoked',
      'token_requested',
      'token_issued',
      'token_failed',
      'data_requested',
      'data_sent',
    ],
    required: true,
  },

  requestMeta: {
    endpoint: String,
    ip: String,
    userAgent: String,
    requestBody: mongoose.Schema.Types.Mixed,
  },

  responseMeta: {
    statusCode: Number,
    status: {
      type: String,
      enum: ['success', 'failed', 'unauthorized'],
    },
    message: String,
  },
  
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ActionLogs', ActionLogSchema);
