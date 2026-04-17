const db = require('../config/database');
const mercadopago = require('../services/mercadopagoService');
const { getOrCreateCarrito } = require('./carritoController');

/**
 * Crea un pedido a partir del carrito actual y genera un pago en dLocal.
 * Toda la operación es transaccional: se reserva stock al instante.
 */
async function checkout(req, res, next) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const {
      nombre_envio, apellido_envio, documento, telefono_envio, email_envio,
      direccion, ciudad, departamento, codigo_postal, pais = 'UY', notas
    } = req.body;

    const carritoId = await getOrCreateCarrito(req.user.id);
    const itemsRes = await client.query(
      `SELECT ci.cantidad, p.id, p.codigo, p.descripcion, p.precio_lista, p.stock
       FROM carrito_items ci
       INNER JOIN productos p ON p.id = ci.producto_id
       WHERE ci.carrito_id = $1 AND p.activo = TRUE
       FOR UPDATE OF p`,
      [carritoId]
    );

    if (itemsRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // Validar stock
    for (const item of itemsRes.rows) {
      if (item.stock < item.cantidad) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Stock insuficiente para ${item.codigo} - ${item.descripcion}`
        });
      }
    }

    const total = itemsRes.rows.reduce(
      (acc, i) => acc + Number(i.precio_lista) * i.cantidad, 0
    );

    // Crear el pedido
    const pedidoRes = await client.query(
      `INSERT INTO pedidos
       (usuario_id, total, estado, nombre_envio, apellido_envio, documento, telefono_envio,
        email_envio, direccion, ciudad, departamento, codigo_postal, pais, notas)
       VALUES ($1, $2, 'pendiente', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [req.user.id, total, nombre_envio, apellido_envio, documento, telefono_envio,
       email_envio, direccion, ciudad, departamento, codigo_postal, pais, notas]
    );
    const pedido = pedidoRes.rows[0];

    // Crear los items del pedido y descontar stock
    for (const item of itemsRes.rows) {
      const subtotal = Number(item.precio_lista) * item.cantidad;
      await client.query(
        `INSERT INTO pedido_items
         (pedido_id, producto_id, codigo, descripcion, precio_unitario, cantidad, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [pedido.id, item.id, item.codigo, item.descripcion, item.precio_lista, item.cantidad, subtotal]
      );
      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2',
        [item.cantidad, item.id]
      );
    }

    // Vaciar el carrito
    await client.query('DELETE FROM carrito_items WHERE carrito_id = $1', [carritoId]);

    const pago = await mercadopago.crearPago(pedido);

    // Guardar referencias del pago
    await client.query(
      'UPDATE pedidos SET payment_id = $1, payment_url = $2 WHERE id = $3',
      [pago.id, pago.redirect_url, pedido.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      pedido_id: pedido.id,
      total,
      payment_url: pago.redirect_url
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

/**
 * Webhook de Mercado Pago: recibe notificaciones de cambio de estado de pago.
 * MP envía { type: "payment", data: { id: "..." } } y luego hay que re-consultar.
 */
async function webhook(req, res, next) {
  try {
    // En producción, verificar firma:
    // if (!mercadopago.verificarFirmaWebhook(req)) {
    //   return res.status(401).json({ error: 'Firma inválida' });
    // }

    const { type, data } = req.body;
    if (type !== 'payment' || !data?.id) {
      return res.status(200).json({ ok: true });
    }

    const paymentId = data.id;
    let estadoFinal;
    let orderId;
    try {
      const info = await mercadopago.obtenerPago(paymentId);
      estadoFinal = mercadopago.mapearEstado(info.status);
      orderId = info.external_reference;
    } catch {
      return res.status(200).json({ ok: false });
    }

    const result = await db.query(
      `UPDATE pedidos SET estado = $1
       WHERE payment_id = $2 OR id = $3
       RETURNING id, estado`,
      [estadoFinal, paymentId, orderId]
    );

    // Si el pago fue rechazado/cancelado, restituir stock
    if (['rechazado', 'cancelado'].includes(estadoFinal) && result.rows.length > 0) {
      const pedidoId = result.rows[0].id;
      await db.query(
        `UPDATE productos p SET stock = stock + pi.cantidad
         FROM pedido_items pi
         WHERE pi.pedido_id = $1 AND pi.producto_id = p.id`,
        [pedidoId]
      );
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error en webhook:', err);
    // Responder 200 para evitar reintentos infinitos en errores no recuperables
    res.status(200).json({ ok: false });
  }
}

async function listarMisPedidos(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, fecha, total, estado, payment_url
       FROM pedidos
       WHERE usuario_id = $1
       ORDER BY fecha DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function obtenerPedido(req, res, next) {
  try {
    const where = req.user.rol === 'admin'
      ? 'WHERE id = $1'
      : 'WHERE id = $1 AND usuario_id = $2';
    const params = req.user.rol === 'admin'
      ? [req.params.id]
      : [req.params.id, req.user.id];

    const pedidoRes = await db.query(`SELECT * FROM pedidos ${where}`, params);
    if (pedidoRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    const itemsRes = await db.query(
      'SELECT * FROM pedido_items WHERE pedido_id = $1',
      [req.params.id]
    );
    res.json({ ...pedidoRes.rows[0], items: itemsRes.rows });
  } catch (err) {
    next(err);
  }
}

async function listarTodos(req, res, next) {
  try {
    const { estado } = req.query;
    const where = estado ? 'WHERE p.estado = $1' : '';
    const params = estado ? [estado] : [];
    const result = await db.query(
      `SELECT p.id, p.fecha, p.total, p.estado, p.nombre_envio, p.apellido_envio,
              u.email
       FROM pedidos p
       INNER JOIN usuarios u ON u.id = p.usuario_id
       ${where}
       ORDER BY p.fecha DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function actualizarEstado(req, res, next) {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado', 'rechazado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const result = await db.query(
      'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

/**
 * Solo disponible en desarrollo: simula el resultado de un pago sin pasar por MP.
 * POST /api/pedidos/dev-simular/:id  { resultado: "aprobado"|"rechazado"|"cancelado" }
 */
async function devSimularPago(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  try {
    const { resultado } = req.body;
    const mapaEstado = { aprobado: 'pagado', rechazado: 'rechazado', cancelado: 'cancelado' };
    const estado = mapaEstado[resultado];
    if (!estado) return res.status(400).json({ error: 'resultado inválido' });

    const result = await db.query(
      'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING id, estado',
      [estado, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    if (['rechazado', 'cancelado'].includes(estado)) {
      await db.query(
        `UPDATE productos p SET stock = stock + pi.cantidad
         FROM pedido_items pi
         WHERE pi.pedido_id = $1 AND pi.producto_id = p.id`,
        [req.params.id]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  checkout, webhook, listarMisPedidos, obtenerPedido, listarTodos, actualizarEstado, devSimularPago
};
