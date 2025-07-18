const mongoose = require("mongoose");

const consentRequestSchema = new mongoose.Schema({
  consentId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  contact: {
    type: String, // email or mobile
    required: true,
  },
  orgName: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  scope: {
    type: [String], // e.g., ['kyc:pan', 'transaction:summary']
    required: true,
  },
  userApprovedScope: {
    type: [String], // e.g., ['kyc:pan', 'transaction:summary']
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected","revoked", "expired"],
    default: "pending",
  },
  callbackUrl: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
});

module.exports = mongoose.model("ConsentRequest", consentRequestSchema);
