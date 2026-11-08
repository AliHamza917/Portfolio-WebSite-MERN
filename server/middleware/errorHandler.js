const errorHandler = (err, req, res, next) => {
  // Handle invalid Mongoose ObjectId
  if (err.name === "CastError") {
    return res.status(404).json({
      message: "Resource not found (invalid ID format)",
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      message: messages.join(", "),
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
