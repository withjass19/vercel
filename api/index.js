const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../config/db");
const authRoutes = require("../routes/authRouters");
const bookRoutes = require("../routes/bookRoutes");
const userRoutes = require("../routes/userRoutes");
const chatRoutes = require("../routes/chatRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Express API is running on Vercel",
  });
});

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API working",
  });
});

app.get("/env-test", (req, res) => {
  res.json({
    mongo: process.env.MONGO_URL ? "Found" : "Missing",
    jwt: process.env.JWT_SECRET ? "Found" : "Missing",
  });
});

app.get("/health", async (req, res) => {
  try {
    await connectDB();

    res.status(200).json({
      success: true,
      message: "DB connected successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "DB connection failed",
      error: error.message,
    });
  }
});

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;