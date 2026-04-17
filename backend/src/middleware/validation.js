const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: errors.array().map(e => ({ campo: e.path, mensaje: e.msg }))
    });
  }
  next();
}

function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor'
  });
}

module.exports = { validate, errorHandler };
