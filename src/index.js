require("dotenv").config();
const express = require("express");
// const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const path = require("path");
const { Server } = require("socket.io");
const http = require("http");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const cors = require("./config/cors");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

const authRoutes = require("./routes/v1/auth");
const userRoutes = require("./routes/v1/user");

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_WHITELIST
      ? process.env.CORS_WHITELIST.split(",")
      : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 100 requests per windowMs
  keyGenerator: (req) => req.ip, // Use correct IP
  message: "Too many requests, please try again later.",
});

// Apply global middlewares
app.set("trust proxy", 1); // Trust first proxy
app.use(limiter);
// app.use(helmet());
app.use(bodyParser.json());
app.use(
  "/uploads",
  cors,
  (req, res, next) => {
    const fs = require("fs");
    const filePath = path.join(__dirname, "../uploads", req.path);
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.sendFile(path.join(__dirname, "../uploads/no-image-found.jpg"));
      } else {
        next();
      }
    });
  },
  express.static(path.join(__dirname, "../uploads"))
);
app.use(cors);

// Attach `io` to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Define default routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
    endpoints: {
      v1: "/api/v1/",
    },
  });
});

app.get("/api/v1/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API v1",
    endpoints: {
      auth: "/api/v1/auth",
      user: "/api/v1/user",
    },
  });
});

// Mount API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

// Handle errors
app.use(errorHandler);

// Set production environment
if (process.env.NODE_ENV === "production") {
  app.set("env", "production");
}

// Start the server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";
server.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export app and server for testing or future use
module.exports = { app, server, io };
