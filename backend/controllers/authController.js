const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userModel = require("../models/userModel");

const BCRYPT_ROUNDS = 12;
const JWT_EXPIRES_IN = "1h";

/**
 * Build a safe public user object.
 * Never expose the password or password hash.
 */
function toSafeUser(user) {
  if (!user) {
    return null;
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  // Include timestamps only when the model returns them.
  if (user.created_at !== undefined) {
    safeUser.created_at = user.created_at;
  }

  if (user.updated_at !== undefined) {
    safeUser.updated_at = user.updated_at;
  }

  return safeUser;
}

/**
 * Create a server-side configuration error.
 * The client should receive a generic 500 response.
 */
function createConfigurationError(message) {
  const error = new Error(message);
  error.statusCode = 500;
  return error;
}

/**
 * POST /api/auth/register
 * Register a new user.
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check whether the email is already registered.
    const existingUser = await userModel.findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash the password before saving it.
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // The model returns the newly created user's ID.
    let userId;

    try {
      userId = await userModel.createUser(name, email, hashedPassword);
    } catch (error) {
      // Handle a duplicate email if another registration
      // created the same account between our check and insert.
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      throw error;
    }

    // Retrieve the saved profile, including timestamps if available.
    const createdUser = await userModel.findUserById(userId);

    // Use a safe fallback if the user cannot be retrieved immediately.
    const safeUser = toSafeUser(createdUser || { id: userId, name, email });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: safeUser,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/auth/login
 * Verify credentials and issue a signed JWT.
 */
async function login(req, res, next) {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    // Never use a hardcoded fallback for the JWT secret.
    if (!jwtSecret || !jwtSecret.trim()) {
      return next(
        createConfigurationError(
          "JWT_SECRET is missing from the server environment.",
        ),
      );
    }

    const { email, password } = req.body;

    const user = await userModel.findUserByEmail(email);

    // Use the same public response for unknown emails
    // and incorrect passwords.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // The token uses "id" consistently as the user ID claim.
    const token = jwt.sign({ id: user.id }, jwtSecret, {
      algorithm: "HS256",
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: toSafeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/auth/me
 * Return the authenticated user's profile.
 *
 * Assumption: authMiddleware sets req.user.id
 * after verifying the JWT.
 */
async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user && req.user.id;

    // Normally authentication middleware should reject this first.
    if (userId === undefined || userId === null) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required.",
      });
    }

    const user = await userModel.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: toSafeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
};
