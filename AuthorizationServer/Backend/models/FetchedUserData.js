const mongoose = require("mongoose");

const FetchedUserDataSchema = new mongoose.Schema({
  clientId:{ type: String, required: true },
  userId: { type: String, required: true },
  consentId: { type: String, required: true }, // To trace back to consent
  purpose: { type: String, required: true },
  fields: [String], // scope fields like ['kyc:name', 'contact:email']
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // Allows dynamic key-value data
    required: true,
  },
  fetchedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FetchedUserData", FetchedUserDataSchema);
