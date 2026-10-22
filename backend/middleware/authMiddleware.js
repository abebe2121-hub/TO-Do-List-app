const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // The JWT secret must be configured before verifying tokens.
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || !jwtSecret.trim()) {
    const error = new Error(
      "JWT_SECRET is missing from the server environment.",
    );
    error.statusCode = 500;
    return next(error);
  }

  // Read the Authorization header.
  const authorization = req.get("Authorization");

  // Require the standard: Authorization: Bearer <token>
  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a Bearer token.",
    });
  }

  const parts = authorization.trim().split(/\s+/);

  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer" || !parts[1]) {
    return res.status(401).json({
      success: false,
      message: "Invalid Authorization header format. Use Bearer <token>.",
    });
  }

  const token = parts[1];

  try {
    // Verify the signature, expiry, and allowed signing algorithm.
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
    });

    // This app signs tokens with { id: user.id }.
    if (
      !decoded ||
      typeof decoded !== "object" ||
      !Number.isSafeInteger(decoded.id) ||
      decoded.id <= 0
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }

    // Trust the verified token, not a user ID from the request.
    req.user = { id: decoded.id };

    // Continue only after successful authentication.
    return next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }

    // Unexpected errors are handled by the existing error middleware.
    return next(error);
  }
}

module.exports = authMiddleware;
