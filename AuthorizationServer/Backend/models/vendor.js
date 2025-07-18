// models/Vendor.js
const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema({
  orgName: String,
  email: { type: String, unique: true },
  phone: String,
  contactPerson: String,
  purpose: String,
  callbackUrl: String,
  dataFields: [String],
  clientId: String,
  clientSecret: String,
  verified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
});

module.exports = mongoose.model("Vendor", VendorSchema);
