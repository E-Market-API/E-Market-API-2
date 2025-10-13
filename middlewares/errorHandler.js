const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    statusCode,
    error: err.name || "Error",
    message: err.customMessage || err.message || "Something went wrong",
  });
};

export default errorHandler;