// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

const vendorRoutes = require("./routes/vendorRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const consentRoutes =  require("./routes/consentRoutes");
const thirdPartyRoutes = require("./routes/thirdPartyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const startCronJobs = require('./utils/cronJobs');
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT;

const DB_URL = process.env.DB_URL;
console.log(DB_URL);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger);

// Connect to MongoDB
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// corn jobs
startCronJobs();

// Routes
app.use("/api", vendorRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api/consent", consentRoutes);
app.use("/api/vendor-data", thirdPartyRoutes);
app.use("/api/admin", adminRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
