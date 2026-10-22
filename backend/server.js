
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Existing database connection
const db = require("./config/db");

// Existing routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

// Existing middleware
const notFoundMiddleware = require("./middleware/notFoundMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// Server configuration
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Enable CORS for the frontend
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Parse incoming request bodies
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "To-Do App Backend is running!",
  });
});

// API health endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "To-Do App API is running",
  });
});

// Mount existing application routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Handle unknown routes
app.use(notFoundMiddleware);

// Centralized error handler (must be last)
app.use(errorMiddleware);

// Start only after verifying the initial database connection
function startServer() {
  db.connect((error) => {
    if (error) {
      console.error("Unable to connect to MySQL.");
      console.error("Error code:", error.code || "UNKNOWN_ERROR");
      console.error("Check your MySQL service and database configuration.");
      process.exitCode = 1;
      return;
    }

    console.log("MySQL database connection established.");

    const server = app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
      console.log(`Allowed frontend origin: ${FRONTEND_URL}`);
    });

    server.on("error", (serverError) => {
      console.error("Unable to start the HTTP server.");
      console.error("Error code:", serverError.code || "UNKNOWN_ERROR");
      process.exitCode = 1;
    });
  });
}

startServer();

module.exports = app;
