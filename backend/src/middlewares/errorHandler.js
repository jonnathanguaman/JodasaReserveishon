module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor.';
  console.error(`[ERROR] ${req.method} ${req.originalUrl} ${status} - ${message}`);
  res.status(status).json({ success: false, message });
};
