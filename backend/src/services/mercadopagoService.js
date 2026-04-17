const axios = require('axios');
const crypto = require('crypto');

const MP_BASE_URL = 'https://api.mercadopago.com';

function getAccessToken() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('MP_ACCESS_TOKEN no configurado');
  return token;
}

/**
 * En desarrollo devuelve una URL local que simula el checkout de MP,
 * evitando llamadas reales a la API y la necesidad de credenciales.
 */
function crearPagoMock(pedido) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return {
    id: `dev_${pedido.id}_${Date.now()}`,
    redirect_url: `${frontendUrl}/checkout/dev-pago?pedido=${pedido.id}`
  };
}

/**
 * Crea una preferencia de pago (checkout hospedado) en Mercado Pago.
 * Retorna init_point (producción) o sandbox_init_point (sandbox).
 * @param {Object} pedido
 * @returns {Promise<{id: string, redirect_url: string}>}
 */
async function crearPago(pedido) {
  if (process.env.NODE_ENV !== 'production') {
    return crearPagoMock(pedido);
  }
  const payload = {
    external_reference: String(pedido.id),
    items: [
      {
        id: String(pedido.id),
        title: `Pedido #${pedido.id} - Casa de Pesca`,
        quantity: 1,
        unit_price: Number(pedido.total),
        currency_id: 'UYU'
      }
    ],
    payer: {
      name: pedido.nombre_envio,
      surname: pedido.apellido_envio,
      email: pedido.email_envio,
      phone: { number: pedido.telefono_envio },
      identification: { type: 'CI', number: pedido.documento },
      address: {
        street_name: pedido.direccion,
        zip_code: pedido.codigo_postal || ''
      }
    },
    back_urls: {
      success: `${process.env.MP_SUCCESS_URL}?pedido=${pedido.id}`,
      failure: `${process.env.MP_FAILURE_URL}?pedido=${pedido.id}`,
      pending: `${process.env.MP_FAILURE_URL}?pedido=${pedido.id}`
    },
    auto_return: 'approved',
    notification_url: process.env.MP_NOTIFICATION_URL,
    statement_descriptor: 'Casa de Pesca'
  };

  try {
    const response = await axios.post(
      `${MP_BASE_URL}/checkout/preferences`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    const isSandbox = process.env.NODE_ENV !== 'production';
    const redirectUrl = isSandbox
      ? response.data.sandbox_init_point
      : response.data.init_point;

    return {
      id: response.data.id,
      redirect_url: redirectUrl,
      raw: response.data
    };
  } catch (err) {
    console.error('Error creando preferencia en Mercado Pago:', err.response?.data || err.message);
    throw new Error('No se pudo iniciar el pago. Intentá nuevamente.');
  }
}

/**
 * Consulta el estado de un pago por ID de pago (no de preferencia).
 * MP envía el payment ID en el webhook, no el preference ID.
 */
async function obtenerPago(paymentId) {
  try {
    const response = await axios.get(
      `${MP_BASE_URL}/v1/payments/${paymentId}`,
      {
        headers: { 'Authorization': `Bearer ${getAccessToken()}` },
        timeout: 10000
      }
    );
    return response.data;
  } catch (err) {
    console.error('Error consultando pago en Mercado Pago:', err.response?.data || err.message);
    throw new Error('No se pudo consultar el estado del pago');
  }
}

/**
 * Mapea el estado de Mercado Pago a nuestro estado interno
 */
function mapearEstado(mpStatus) {
  const map = {
    'approved': 'pagado',
    'authorized': 'pagado',
    'pending': 'pendiente',
    'in_process': 'pendiente',
    'in_mediation': 'pendiente',
    'rejected': 'rechazado',
    'cancelled': 'cancelado',
    'refunded': 'cancelado',
    'charged_back': 'cancelado'
  };
  return map[mpStatus?.toLowerCase()] || 'pendiente';
}

/**
 * Verifica la firma HMAC del webhook de Mercado Pago.
 * MP envía el header x-signature con formato: ts=...;v1=...
 * El string a firmar es: id:[data.id];request-id:[x-request-id];ts:[ts];
 */
function verificarFirmaWebhook(req) {
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  const secret = process.env.MP_WEBHOOK_SECRET;

  if (!xSignature || !secret) return false;

  const parts = Object.fromEntries(
    xSignature.split(';').map(part => part.split('='))
  );
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  const dataId = req.body?.data?.id ?? '';
  const manifest = `id:${dataId};request-id:${xRequestId || ''};ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
  } catch {
    return false;
  }
}

module.exports = {
  crearPago,
  obtenerPago,
  mapearEstado,
  verificarFirmaWebhook
};
