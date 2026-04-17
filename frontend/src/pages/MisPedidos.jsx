import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatearPrecio, formatearFecha } from '../utils/helpers';

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    api.get('/pedidos/mis-pedidos')
      .then(({ data }) => setPedidos(data))
      .finally(() => setLoading(false));
  }, []);

  const navigate = useNavigate();

  const verDetalle = async (id) => {
    const { data } = await api.get(`/pedidos/${id}`);
    setDetalle(data);
  };

  if (loading) return <div className="container loading">⏳ Cargando pedidos...</div>;

  if (pedidos.length === 0) {
    return (
      <div className="container">
        <div className="empty">
          <div className="empty-icon">📋</div>
          <h2>Aún no tenés pedidos</h2>
          <p>¡Es momento de salir a pescar algo bueno!</p>
          <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: 16 }}>
            🌊 Ver catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: 20, color: 'var(--azul-profundo)' }}>📋 Mis pedidos</h2>

      <table className="tabla">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(p => (
            <tr key={p.id}>
              <td><strong>#{p.id}</strong></td>
              <td>{formatearFecha(p.fecha)}</td>
              <td><strong>{formatearPrecio(p.total)}</strong></td>
              <td><span className={`badge badge-${p.estado}`}>{p.estado}</span></td>
              <td>
                <button onClick={() => verDetalle(p.id)} className="btn-ghost">Ver detalle</button>
                {p.estado === 'pendiente' && p.payment_url && (
                  <a href={p.payment_url} className="btn btn-coral" style={{ marginLeft: 8, fontSize: 12, padding: '6px 12px' }}>
                    💳 Pagar ahora
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {detalle && (
        <div onClick={() => setDetalle(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'white', borderRadius: 14, padding: 30, maxWidth: 600, width: '100%',
            maxHeight: '85vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: 'var(--azul-profundo)' }}>Pedido #{detalle.id}</h3>
              <button onClick={() => setDetalle(null)} className="btn-ghost">✕</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <span className={`badge badge-${detalle.estado}`}>{detalle.estado}</span>
              <span style={{ marginLeft: 10, color: 'var(--gris-niebla)', fontSize: 13 }}>
                {formatearFecha(detalle.fecha)}
              </span>
            </div>

            <h4 style={{ marginBottom: 8, color: 'var(--azul-mar)' }}>📦 Productos</h4>
            <table className="tabla" style={{ marginBottom: 16 }}>
              <thead>
                <tr><th>Código</th><th>Producto</th><th>Cant.</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {detalle.items?.map(it => (
                  <tr key={it.id}>
                    <td style={{ fontSize: 12 }}>{it.codigo}</td>
                    <td style={{ fontSize: 13 }}>{it.descripcion}</td>
                    <td>{it.cantidad}</td>
                    <td><strong>{formatearPrecio(it.subtotal)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ background: 'var(--espuma)', padding: 14, borderRadius: 8, marginBottom: 14 }}>
              <h4 style={{ color: 'var(--azul-mar)', marginBottom: 6 }}>📍 Envío</h4>
              <p style={{ fontSize: 13 }}>
                {detalle.nombre_envio} {detalle.apellido_envio}<br/>
                {detalle.direccion}<br/>
                {detalle.ciudad}, {detalle.departamento} {detalle.codigo_postal}<br/>
                Tel: {detalle.telefono_envio}
              </p>
            </div>

            <div className="carrito-total" style={{ fontSize: 20 }}>
              <span>Total</span>
              <span>{formatearPrecio(detalle.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
