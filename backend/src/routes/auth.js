const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { registro, login, perfil } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.post('/registro', [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('apellido').trim().notEmpty().withMessage('Apellido requerido'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  validate
], registro);

router.post('/login', [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Contraseña requerida'),
  validate
], login);

router.get('/perfil', authenticate, perfil);

module.exports = router;
