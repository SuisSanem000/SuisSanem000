// 404 Not Found handler
const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
};

// Global error handler (must have 4 params)
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
};

module.exports = { notFoundHandler, errorHandler };
