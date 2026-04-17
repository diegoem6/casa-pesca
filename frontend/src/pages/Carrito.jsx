import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { formatearPrecio, iconoCategoria } from '../utils/helpers';

export default function Carrito() {
  const { items, total, actualizar, eliminar, vaciar, loading } = useCarrito();
  const navigate = useNavigate();

  if (loading) return <div className="container loading">⏳ Cargando carrito...</div>;

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty">
          <div className="empty-icon">🎣</div>
          <h2>Tu carrito está vacío</h2>
          <p>Aún no agregaste productos. ¡Echá una línea al catálogo!</p>
          <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: 20 }}>
            🌊 Ir al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: 20, color: 'var(--azul-profundo)' }}>🛒 Tu carrito</h2>

      {items.map(item => (
        <div className="carrito-item" key={item.id}>
          {item.imagen_url ? (
            <img src={item.imagen_url} alt={item.descripcion} />
          ) : (
            <div style={{ width: 80, height: 80, background: 'var(--espuma)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
              {iconoCategoria(item.categoria)}
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, color: 'var(--madera)', fontWeight: 600 }}>{item.codigo}</div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.descripcion}</div>
            <div style={{ fontSize: 13, color: 'var(--gris-niebla)' }}>
              {formatearPrecio(item.precio_lista)} c/u
            </div>
          </div>
          <div className="qty-control">
            <button
              className="qty-btn"
              onClick={() => item.cantidad > 1 && actualizar(item.id, item.cantidad - 1)}
              disabled={item.cantidad <= 1}
            >−</button>
            <span className="qty-val">{item.cantidad}</span>
            <button
              className="qty-btn"
              onClick={() => item.cantidad < item.stock && actualizar(item.id, item.cantidad + 1)}
              disabled={item.cantidad >= item.stock}
            >+</button>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--azul-profundo)' }}>
              {formatearPrecio(item.subtotal)}
            </div>
            <button onClick={() => eliminar(item.id)} className="btn-ghost" style={{ color: 'var(--rojo-coral)', fontSize: 12, marginTop: 4 }}>
              ✕ Quitar
            </button>
          </div>
        </div>
      ))}

      <div className="carrito-resumen">
        <div className="carrito-total">
          <span>Total a pagar</span>
          <span>{formatearPrecio(total)}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <button onClick={vaciar} className="btn btn-outline">🗑 Vaciar carrito</button>
          <button onClick={() => navigate('/checkout')} className="btn btn-primary" style={{ fontSize: 16, padding: '12px 28px' }}>
            ⚓ Continuar a la compra →
          </button>
        </div>
      </div>
    </div>
  );
}
