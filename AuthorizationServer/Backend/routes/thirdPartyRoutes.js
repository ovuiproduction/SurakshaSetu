// routes/vendor.js
const express = require("express");
const router = express.Router();
const FetchedUserData = require("../models/FetchedUserData");

router.post("/store-fetched-data", async (req, res) => {
  try {
    const { clientId, userId, consentId, purpose, fields, data } = req.body;

    // Basic validation
    if (!clientId || !userId || !consentId || !purpose || !fields || !data) {
      return res.status(400).json({
        message:
          "All fields (userId, consentId, purpose, fields, data) are required",
      });
    }

    // Save new record
    const fetchedRecord = new FetchedUserData({
      clientId,
      userId,
      consentId,
      purpose,
      fields,
      data,
    });

    await fetchedRecord.save();

    res.status(201).json({ message: "User data stored successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error saving fetched user data: ${error.message}` });
  }
});

router.post("/fetch-records", async (req, res) => {
  try {
    const { clientId } = req.body;
    const records = await FetchedUserData.find({ clientId: clientId }).sort({
      fetchedAt: -1,
    }); // most recent first
    res.status(200).json(records);
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error retrieving fetched user data: ${err}` });
  }
});

module.exports = router;
