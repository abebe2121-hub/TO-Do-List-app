const express = require("express");

const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");

const {
  validateRegister,
  validateLogin,
} = require("../validators/authValidator");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/auth/register
// Validate registration data before creating an account.
router.post("/register", validateRegister, register);

// POST /api/auth/login
// Validate login data before checking credentials.
router.post("/login", validateLogin, login);

// GET /api/auth/me
// Require a valid JWT before returning the current user's profile.
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;
