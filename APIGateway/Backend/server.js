// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;


const gatewayRoutes = require("./routes/gatewayRoutes");

// Connect to MongoDB
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));


// Routes
app.use("/api/gateway", gatewayRoutes);

app.get('/',(req,res)=>{
    res.send(`API Gateway Server running on port ${PORT}`);
})

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway Server running on http://localhost:${PORT}`);
});
