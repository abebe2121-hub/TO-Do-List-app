function notFoundMiddleware(req, res, next) {
  return res.status(404).json({
    success: false,
    message: "API route not found.",
  });
}

module.exports = notFoundMiddleware;
