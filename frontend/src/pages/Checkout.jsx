import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { formatearPrecio, DEPARTAMENTOS_UY } from '../utils/helpers';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, refrescar } = useCarrito();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    nombre_envio: user?.nombre || '',
    apellido_envio: user?.apellido || '',
    documento: '',
    telefono_envio: '',
    email_envio: user?.email || '',
    direccion: '',
    ciudad: '',
    departamento: 'Montevideo',
    codigo_postal: '',
    pais: 'UY',
    notas: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const { data } = await api.post('/pedidos/checkout', form);
      await refrescar();
      // Redirigir a dLocal Go para realizar el pago
      window.location.href = data.payment_url;
    } catch (err) {
      setError(err.response?.data?.error || 'Error procesando el pedido');
      setEnviando(false);
    }
  };

  if (items.length === 0 && !enviando) {
    return (
      <div className="container">
        <div className="empty">
          <div className="empty-icon">🛒</div>
          <h3>No hay productos en el carrito</h3>
          <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: 16 }}>
            Ir al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container checkout-container">
      <h2 className="checkout-titulo">⚓ Finalizar compra</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="checkout-grid">

        <div className="checkout-resumen">
          <h3 style={{ marginBottom: 14, color: 'var(--naranja)' }}>🛒 Resumen</h3>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--borde)', fontSize: 13 }}>
              <span>{item.cantidad}× {item.descripcion.substring(0, 28)}</span>
              <strong style={{ marginLeft: 8, whiteSpace: 'nowrap' }}>{formatearPrecio(item.subtotal)}</strong>
            </div>
          ))}
          <div className="carrito-total" style={{ marginTop: 16, fontSize: 20 }}>
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <h3 style={{ marginBottom: 16, color: 'var(--naranja)' }}>📦 Datos para el envío</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Nombre *</label>
              <input name="nombre_envio" value={form.nombre_envio} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Apellido *</label>
              <input name="apellido_envio" value={form.apellido_envio} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Documento (CI) *</label>
              <input name="documento" value={form.documento} onChange={handleChange} placeholder="1.234.567-8" required />
            </div>
            <div className="form-group">
              <label>Teléfono *</label>
              <input name="telefono_envio" value={form.telefono_envio} onChange={handleChange} placeholder="099 123 456" required />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input type="email" name="email_envio" value={form.email_envio} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Dirección *</label>
            <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Av. 18 de Julio 1234, apto 5" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ciudad *</label>
              <input name="ciudad" value={form.ciudad} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Departamento *</label>
              <select name="departamento" value={form.departamento} onChange={handleChange} required>
                {DEPARTAMENTOS_UY.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Código postal</label>
            <input name="codigo_postal" value={form.codigo_postal} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Notas adicionales</label>
            <textarea name="notas" value={form.notas} onChange={handleChange} rows="3" placeholder="Instrucciones de entrega, referencias, etc." />
          </div>

          <button type="submit" className="btn btn-primary" disabled={enviando} style={{ width: '100%', fontSize: 16, padding: '14px' }}>
            {enviando ? '⏳ Procesando...' : '💳 Pagar con Mercado Pago'}
          </button>
          <p style={{ fontSize: 12, color: 'var(--texto-sec)', marginTop: 10, textAlign: 'center' }}>
            Serás redirigido al checkout seguro de Mercado Pago para completar el pago.
          </p>
        </form>

      </div>
    </div>
  );
}
