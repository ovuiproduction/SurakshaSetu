// models/issuedToken.js
const mongoose = require("mongoose");

const issuedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  userId: String,
  clientId: String,
  consentId: { type: mongoose.Schema.Types.ObjectId, ref: "ConsentRequest" },
  scope: [String],
  purpose: String,
});

module.exports = mongoose.model("IssuedToken", issuedTokenSchema);
