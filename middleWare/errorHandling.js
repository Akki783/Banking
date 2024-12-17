const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === "CastError") {
    return res.status(404).json({ error: "Resource not found" });
  }

  res.status(500).json({ error: "Something went wrong, try again later." });
};

module.exports = errorHandler;
