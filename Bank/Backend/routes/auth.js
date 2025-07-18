const express = require("express");
const router = express.Router();
const User = require("../models/user");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

// Email transporter setup
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

function generateAccountNumber() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}


// ➤ Register user
router.post("/register-user", async (req, res) => {
  try {
    const { fullName, email, phone, dob,gender, pan, address, salary } = req.body;
   
    const userId = `USER-${uuidv4().slice(0, 8).toUpperCase()}`;

    const accountNumber = generateAccountNumber();

    const newUser = new User({
      userId,
      fullName,
      email,
      phone,
      dob,
      gender,
      pan,
      address,
      accountNumber,
      salary,
      bankBalance:0
    });

    await newUser.save();
    res.status(201).json({ message: "User registered", userId });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// ➤ Request OTP
router.post("/login/request-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60000); // 5 minutes expiry

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login OTP",
      text: `Your OTP for login is: ${otp}`,
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "OTP request failed", error: err.message });
  }
});

// ➤ Verify OTP
router.post("/login/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Login successful", user:user });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed", error: err.message });
  }
});

module.exports = router;
