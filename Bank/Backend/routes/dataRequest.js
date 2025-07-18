const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/get-data", async (req, res) => {
  const { userId, scope } = req.body;

  const fieldMap = {
    "kyc:name": "fullName",
    "kyc:pan": "pan",
    "kyc:dob": "dob",
    "contact:email": "email",
    "contact:phone": "phone",
    "kyc:gender": "gender",
    "address": "address",
    "account:accountNumber": "accountNumber",
    "account:salary": "salary",
    "account:bankBalance": "bankBalance",
  };

  try {
    const user = await User.findOne({ userId }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // Translate scope keys to actual DB field names
    const fieldsToSend = scope
      .map((s) => fieldMap[s])
      .filter(Boolean); // Remove undefined mappings

    const filteredData = fieldsToSend.reduce((acc, field) => {
      if (user.hasOwnProperty(field)) {
        acc[field] = user[field];
      }
      return acc;
    }, {});

    res.status(200).json({ userId, data: filteredData });
  } catch (err) {
    console.error("Error filtering user data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;