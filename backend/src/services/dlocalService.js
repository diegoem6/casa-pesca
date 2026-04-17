const axios = require('axios');
const crypto = require('crypto');

/**
 * Integración con dLocal Go - Checkout hospedado
 * Documentación: https://docs.dlocalgo.com/
 *
 * Flujo:
 * 1. Backend crea un payment via POST /payments → recibe redirect_url
 * 2. Frontend redirige al usuario a esa URL
 * 3. Usuario paga en dLocal Go
 * 4. dLocal redirige al success_url o back_url
 * 5. dLocal envía webhook con el estado final del pago
 */

const DLOCAL_BASE_URL = process.env.DLOCAL_BASE_URL || 'https://api.dlocalgo.com/v1';

function getAuthHeader() {
  const apiKey = process.env.DLOCAL_API_KEY;
  const secretKey = process.env.DLOCAL_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error('Credenciales de dLocal no configuradas (DLOCAL_API_KEY / DLOCAL_SECRET_KEY)');
  }
  return `Bearer ${apiKey}:${secretKey}`;
}

/**
 * Crea un pago (checkout hospedado) en dLocal Go
 * @param {Object} pedido - Datos del pedido
 * @returns {Promise<{id: string, redirect_url: string}>}
 */
async function crearPago(pedido) {
  const payload = {
    amount: Number(pedido.total),
    currency: 'UYU',
    country: 'UY',
    order_id: String(pedido.id),
    description: `Pedido #${pedido.id} - Casa de Pesca`,
    success_url: `${process.env.DLOCAL_SUCCESS_URL}?pedido=${pedido.id}`,
    back_url: `${process.env.DLOCAL_BACK_URL}?pedido=${pedido.id}`,
    notification_url: process.env.DLOCAL_NOTIFICATION_URL,
    payer: {
      name: `${pedido.nombre_envio} ${pedido.apellido_envio}`,
      email: pedido.email_envio,
      document: pedido.documento,
      phone: pedido.telefono_envio,
      address: {
        street: pedido.direccion,
        city: pedido.ciudad,
        state: pedido.departamento,
        zip_code: pedido.codigo_postal || '',
        country: pedido.pais || 'UY'
      }
    }
  };

  try {
    const response = await axios.post(`${DLOCAL_BASE_URL}/payments`, payload, {
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    return {
      id: response.data.id,
      redirect_url: response.data.redirect_url || response.data.payment_url,
      raw: response.data
    };
  } catch (err) {
    console.error('Error creando pago en dLocal:', err.response?.data || err.message);
    throw new Error('No se pudo iniciar el pago. Intentá nuevamente.');
  }
}

/**
 * Consulta el estado actual de un pago
 */
async function obtenerPago(paymentId) {
  try {
    const response = await axios.get(`${DLOCAL_BASE_URL}/payments/${paymentId}`, {
      headers: { 'Authorization': getAuthHeader() },
      timeout: 10000
    });
    return response.data;
  } catch (err) {
    console.error('Error consultando pago en dLocal:', err.response?.data || err.message);
    throw new Error('No se pudo consultar el estado del pago');
  }
}

/**
 * Mapea el estado de dLocal a nuestro estado interno
 */
function mapearEstado(dlocalStatus) {
  const map = {
    'PAID': 'pagado',
    'AUTHORIZED': 'pagado',
    'PENDING': 'pendiente',
    'REJECTED': 'rechazado',
    'CANCELLED': 'cancelado',
    'EXPIRED': 'cancelado',
    'REFUNDED': 'cancelado'
  };
  return map[dlocalStatus?.toUpperCase()] || 'pendiente';
}

/**
 * Verifica la firma HMAC del webhook (recomendado en producción).
 * dLocal envía un header con la firma calculada con el secret key.
 */
function verificarFirmaWebhook(req) {
  const signature = req.headers['x-signature'] || req.headers['signature'];
  if (!signature) return false;
  const secret = process.env.DLOCAL_SECRET_KEY;
  const payload = JSON.stringify(req.body);
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

module.exports = {
  crearPago,
  obtenerPago,
  mapearEstado,
  verificarFirmaWebhook
};
