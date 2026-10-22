require("dotenv").config();

const mysql = require("mysql2");

// Validate required database settings
const requiredVariables = ["DB_HOST", "DB_PORT", "DB_USER", "DB_NAME"];

const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable],
);

if (missingVariables.length > 0) {
  console.error(
    `Missing database environment variables: ${missingVariables.join(", ")}`,
  );
  throw new Error("Database configuration is incomplete.");
}

// Create a single MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((error) => {
  if (error) {
    console.error("MySQL connection failed.");
    console.error("Error code:", error.code || "UNKNOWN_ERROR");
    console.error("Error message:", error.message);
    return;
  }

  console.log(
    `Connected successfully to MySQL database "${process.env.DB_NAME}".`,
  );
});

// Handle later connection errors
db.on("error", (error) => {
  console.error("MySQL connection error.");
  console.error("Error code:", error.code || "UNKNOWN_ERROR");
  console.error("Error message:", error.message);
});

module.exports = db;
