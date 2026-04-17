const db = require('../config/database');

async function getOrCreateCarrito(usuarioId) {
  let r = await db.query('SELECT id FROM carritos WHERE usuario_id = $1', [usuarioId]);
  if (r.rows.length === 0) {
    r = await db.query(
      'INSERT INTO carritos (usuario_id) VALUES ($1) RETURNING id',
      [usuarioId]
    );
  }
  return r.rows[0].id;
}

async function obtener(req, res, next) {
  try {
    const carritoId = await getOrCreateCarrito(req.user.id);
    const items = await db.query(
      `SELECT ci.id, ci.cantidad, p.id AS producto_id, p.codigo, p.descripcion,
              p.precio_lista, p.imagen_url, p.stock, p.categoria,
              (ci.cantidad * p.precio_lista) AS subtotal
       FROM carrito_items ci
       INNER JOIN productos p ON p.id = ci.producto_id
       WHERE ci.carrito_id = $1 AND p.activo = TRUE
       ORDER BY ci.id`,
      [carritoId]
    );
    const total = items.rows.reduce((acc, i) => acc + Number(i.subtotal), 0);
    res.json({ items: items.rows, total });
  } catch (err) {
    next(err);
  }
}

async function agregar(req, res, next) {
  try {
    const { producto_id, cantidad = 1 } = req.body;
    if (cantidad < 1) return res.status(400).json({ error: 'Cantidad inválida' });

    // Verificar producto y stock
    const prod = await db.query(
      'SELECT id, stock FROM productos WHERE id = $1 AND activo = TRUE',
      [producto_id]
    );
    if (prod.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    if (prod.rows[0].stock < cantidad) {
      return res.status(400).json({ error: `Stock insuficiente (disponibles: ${prod.rows[0].stock})` });
    }

    const carritoId = await getOrCreateCarrito(req.user.id);

    // Upsert: sumar si ya existe
    const existing = await db.query(
      'SELECT id, cantidad FROM carrito_items WHERE carrito_id = $1 AND producto_id = $2',
      [carritoId, producto_id]
    );

    if (existing.rows.length > 0) {
      const nuevaCantidad = existing.rows[0].cantidad + cantidad;
      if (nuevaCantidad > prod.rows[0].stock) {
        return res.status(400).json({ error: `Stock insuficiente (disponibles: ${prod.rows[0].stock})` });
      }
      await db.query(
        'UPDATE carrito_items SET cantidad = $1 WHERE id = $2',
        [nuevaCantidad, existing.rows[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO carrito_items (carrito_id, producto_id, cantidad) VALUES ($1, $2, $3)',
        [carritoId, producto_id, cantidad]
      );
    }

    await db.query('UPDATE carritos SET fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $1', [carritoId]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const { cantidad } = req.body;
    if (cantidad < 1) return res.status(400).json({ error: 'Cantidad inválida' });

    const carritoId = await getOrCreateCarrito(req.user.id);
    // Verificar que el item pertenezca al carrito del usuario
    const item = await db.query(
      `SELECT ci.id, p.stock FROM carrito_items ci
       INNER JOIN productos p ON p.id = ci.producto_id
       WHERE ci.id = $1 AND ci.carrito_id = $2`,
      [req.params.itemId, carritoId]
    );
    if (item.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado en el carrito' });
    }
    if (cantidad > item.rows[0].stock) {
      return res.status(400).json({ error: `Stock insuficiente (disponibles: ${item.rows[0].stock})` });
    }

    await db.query('UPDATE carrito_items SET cantidad = $1 WHERE id = $2', [cantidad, req.params.itemId]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    const carritoId = await getOrCreateCarrito(req.user.id);
    await db.query(
      'DELETE FROM carrito_items WHERE id = $1 AND carrito_id = $2',
      [req.params.itemId, carritoId]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function vaciar(req, res, next) {
  try {
    const carritoId = await getOrCreateCarrito(req.user.id);
    await db.query('DELETE FROM carrito_items WHERE carrito_id = $1', [carritoId]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { obtener, agregar, actualizar, eliminar, vaciar, getOrCreateCarrito };
