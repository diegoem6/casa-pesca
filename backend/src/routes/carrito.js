const express = require('express');
const router = express.Router();
const { obtener, agregar, actualizar, eliminar, vaciar } = require('../controllers/carritoController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', obtener);
router.post('/items', agregar);
router.put('/items/:itemId', actualizar);
router.delete('/items/:itemId', eliminar);
router.delete('/', vaciar);

module.exports = router;
