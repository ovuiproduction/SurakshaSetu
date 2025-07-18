const express = require("express");
const router = express.Router();
const User = require("../models/user");

// GET /api/user/profile/:userId
router.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch user info
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/transaction", async (req, res) => {
  const { userId, amount, type, description, date } = req.body;

  if (!userId || !amount || !type || !description || !date) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const numericAmount = parseFloat(amount);

    if (type === "debit" && user.bankBalance < numericAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Create transaction
    const newTransaction = {
      date: new Date(date),
      amount: numericAmount,
      type,
      description,
    };

    user.transactions.push(newTransaction);

    // Update balance
    if (type === "credit") {
      user.bankBalance += numericAmount;
    } else if (type === "debit") {
      user.bankBalance -= numericAmount;
    }

    await user.save();

    res
      .status(200)
      .json({ message: "Transaction recorded and balance updated" });
  } catch (err) {
    console.error("Transaction error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify-user", async (req, res) => {
  const { userId } = req.body;
  try {
    // Fetch user info
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
