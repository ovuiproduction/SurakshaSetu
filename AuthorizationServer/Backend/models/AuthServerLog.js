const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  method: String,
  url: String,
  status: Number,
  ip: String,
  duration: Number,
  request: Object,
  response: Object,
  level: { type: String, default: "info" },
});

module.exports = mongoose.model("AuthServerLog", LogSchema);