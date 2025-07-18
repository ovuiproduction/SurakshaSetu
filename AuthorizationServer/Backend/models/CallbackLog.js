// models/callbackLog.js
const mongoose = require("mongoose");

const callbackLogSchema = new mongoose.Schema({
  consentId: { type: mongoose.Schema.Types.ObjectId, ref: "ConsentRequest", required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  callbackUrl: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  requestPayload: { type: mongoose.Schema.Types.Mixed }, // 💡 What was sent
  responseStatus: Number,
  responseBody: mongoose.Schema.Types.Mixed,
  manualMode: { type: Boolean, default: true },
  status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
});

module.exports = mongoose.model("CallbackLog", callbackLogSchema);
