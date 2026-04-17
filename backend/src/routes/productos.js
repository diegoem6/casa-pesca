const express = require('express');
const router = express.Router();
const { listar, obtener, crear, actualizar, eliminar } = require('../controllers/productosController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Públicas (catálogo)
router.get('/', listar);
router.get('/:id', obtener);

// Admin
router.post('/', authenticate, requireAdmin, upload.single('imagen'), crear);
router.put('/:id', authenticate, requireAdmin, upload.single('imagen'), actualizar);
router.delete('/:id', authenticate, requireAdmin, eliminar);

module.exports = router;
