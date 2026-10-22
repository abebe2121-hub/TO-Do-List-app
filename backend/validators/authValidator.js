
const ALLOWED_REGISTER_FIELDS = ["name", "email", "password"];
const ALLOWED_LOGIN_FIELDS = ["email", "password"];

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 150;

// bcrypt has a 72-byte password input limit.
// A maximum of 72 UTF-8 bytes avoids silently accepting
// passwords that bcrypt would truncate.
const MAX_PASSWORD_BYTES = 72;

/**
 * Check whether the request body is a non-null,
 * non-array object.
 */
function isValidBody(body) {
  return (
    body !== null &&
    typeof body === "object" &&
    !Array.isArray(body)
  );
}

/**
 * Return a consistent HTTP 400 validation response.
 */
function sendValidationError(res, errors) {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors,
  });
}

/**
 * Validate a basic email address format.
 * This checks common syntax, not whether the address exists.
 */
function isValidEmail(email) {
  if (
    typeof email !== "string" ||
    email.length > MAX_EMAIL_LENGTH
  ) {
    return false;
  }

  // Reject whitespace and require a basic local@domain.tld format.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate registration input.
 */
function validateRegister(req, res, next) {
  if (!isValidBody(req.body)) {
    return sendValidationError(res, [
      "Request body must be a valid JSON object.",
    ]);
  }

  const errors = [];
  const body = req.body;

  // Reject unexpected fields such as role or user_id.
  const unsupportedFields = Object.keys(body).filter(
    (field) => !ALLOWED_REGISTER_FIELDS.includes(field)
  );

  if (unsupportedFields.length > 0) {
    errors.push(
      `Unsupported fields: ${unsupportedFields.join(", ")}.`
    );
  }

  // Validate name.
  if (typeof body.name !== "string") {
    errors.push("Name is required and must be a string.");
  } else {
    body.name = body.name.trim();

    if (body.name.length < 2) {
      errors.push("Name must contain at least 2 characters.");
    } else if (body.name.length > MAX_NAME_LENGTH) {
      errors.push("Name must not exceed 100 characters.");
    }
  }

  // Normalize email for consistent storage and lookup.
  if (typeof body.email !== "string") {
    errors.push("A valid email address is required.");
  } else {
    body.email = body.email.trim().toLowerCase();

    if (!isValidEmail(body.email)) {
      errors.push("A valid email address is required.");
    }
  }

  // Do not trim or modify the password.
  if (typeof body.password !== "string" || body.password.length === 0) {
    errors.push("Password is required and must be a non-empty string.");
  } else {
    if (body.password.length < 8) {
      errors.push("Password must contain at least 8 characters.");
    }

    if (
      Buffer.byteLength(body.password, "utf8") >
      MAX_PASSWORD_BYTES
    ) {
      errors.push(
        "Password must not exceed 72 UTF-8 bytes."
      );
    }
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  return next();
}

/**
 * Validate login input.
 * Do not apply registration password-length rules here.
 */
function validateLogin(req, res, next) {
  if (!isValidBody(req.body)) {
    return sendValidationError(res, [
      "Request body must be a valid JSON object.",
    ]);
  }

  const errors = [];
  const body = req.body;

  // Reject unexpected fields.
  const unsupportedFields = Object.keys(body).filter(
    (field) => !ALLOWED_LOGIN_FIELDS.includes(field)
  );

  if (unsupportedFields.length > 0) {
    errors.push(
      `Unsupported fields: ${unsupportedFields.join(", ")}.`
    );
  }

  // Normalize email exactly as during registration.
  if (typeof body.email !== "string") {
    errors.push("A valid email address is required.");
  } else {
    body.email = body.email.trim().toLowerCase();

    if (!isValidEmail(body.email)) {
      errors.push("A valid email address is required.");
    }
  }

  // Do not trim or modify the password before verification.
  if (typeof body.password !== "string" || body.password.length === 0) {
    errors.push("Password is required.");
  }

  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }

  return next();
}

module.exports = {
  validateRegister,
  validateLogin,
};
