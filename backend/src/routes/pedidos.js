const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  checkout, webhook, listarMisPedidos, obtenerPedido, listarTodos, actualizarEstado, devSimularPago
} = require('../controllers/pedidosController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.post('/webhook', webhook);
if (process.env.NODE_ENV !== 'production') {
  router.post('/dev-simular/:id', devSimularPago);
}

// Cliente
router.post('/checkout', authenticate, [
  body('nombre_envio').trim().notEmpty(),
  body('apellido_envio').trim().notEmpty(),
  body('documento').trim().notEmpty(),
  body('telefono_envio').trim().notEmpty(),
  body('email_envio').isEmail(),
  body('direccion').trim().notEmpty(),
  body('ciudad').trim().notEmpty(),
  body('departamento').trim().notEmpty(),
  validate
], checkout);

router.get('/mis-pedidos', authenticate, listarMisPedidos);
router.get('/:id', authenticate, obtenerPedido);

// Admin
router.get('/', authenticate, requireAdmin, listarTodos);
router.patch('/:id/estado', authenticate, requireAdmin, actualizarEstado);

module.exports = router;
