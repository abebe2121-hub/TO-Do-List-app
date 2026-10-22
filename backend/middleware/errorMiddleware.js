function errorMiddleware(err, req, res, next) {
  // If the response has already started, let Express handle the error.
  if (res.headersSent) {
    return next(err);
  }

  // Log diagnostic information on the server during development.
  // Do not send stack traces or internal error details to the client.
  if (process.env.NODE_ENV !== "production") {
    console.error("[Error Middleware]", {
      method: req.method,
      path: req.originalUrl,
      message: err && err.message,
      stack: err && err.stack,
    });
  }

  // Handle malformed JSON sent to Express JSON middleware.
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  // Use a valid HTTP status supplied by the application.
  const candidateStatus = err && (err.statusCode ?? err.status);

  const statusCode =
    Number.isInteger(candidateStatus) &&
    candidateStatus >= 400 &&
    candidateStatus <= 599
      ? candidateStatus
      : 500;

  // Only expose deliberately marked, client-safe application errors.
  const isSafeClientError =
    err &&
    err.isOperational === true &&
    statusCode < 500 &&
    typeof err.message === "string" &&
    err.message.trim().length > 0;

  // Never expose internal error messages for server errors.
  const message = isSafeClientError
    ? err.message
    : statusCode < 500
      ? "The request could not be processed."
      : "An unexpected server error occurred.";

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorMiddleware;
