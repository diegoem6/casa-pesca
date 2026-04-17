const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

function generarToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function registro(req, res, next) {
  try {
    const { nombre, apellido, email, password, telefono } = req.body;

    const existente = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existente.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol)
       VALUES ($1, $2, $3, $4, $5, 'cliente')
       RETURNING id, nombre, apellido, email, telefono, rol, fecha_alta`,
      [nombre, apellido, email, passwordHash, telefono || null]
    );

    const user = result.rows[0];
    const token = generarToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await db.query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = TRUE',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generarToken(user);
    delete user.password_hash;
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
}

async function perfil(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, nombre, apellido, email, telefono, rol, fecha_alta FROM usuarios WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { registro, login, perfil };
