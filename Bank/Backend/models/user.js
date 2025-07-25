const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  name: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  dob: Date,
  gender: String,
  pan: { type: String, required: true, unique: true },
  aadhaar:{ type: String, required: true, unique: true },
  address: String,
  accountNumber: { type: String, required: true },
  salary: Number,
  bankBalance: Number,
  transactions: [
    {
      date: { type: Date },
      amount: { type: Number },
      type: { type: String, enum: ["credit", "debit"] },
      description: { type: String },
    },
  ],

  createdAt: { type: Date, default: Date.now },
  otp: String,
  otpExpiry: Date,
});

module.exports = mongoose.model("User", userSchema);
