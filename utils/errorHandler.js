const errorHandler = (err, req, res, next) => {
  let message = err.message;
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err.name === "ValidationError") {
    statusCode = 400;
    const missingFields = Object.values(err.errors)
      .filter((e) => e.kind === "required")
      .map((e) => e.path);

    message = missingFields.length
      ? `Missing required fields: ${missingFields.join(", ")}`
      : "Validation Error: Invalid data";
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "PRODUCTION" ? null : err.stack,
  });
};

module.exports = errorHandler;