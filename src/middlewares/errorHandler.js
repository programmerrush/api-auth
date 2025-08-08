const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  const response = {
    message: "Something went wrong",
  };

  if (process.env.NODE_ENV !== "production") {
    response.error = err.stack; // Include stack trace in non-production environments
  }

  res.status(500).json(response);
};

module.exports = errorHandler;
