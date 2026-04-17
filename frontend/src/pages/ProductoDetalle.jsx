import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { formatearPrecio, iconoCategoria, labelCategoria } from '../utils/helpers';

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { agregar } = useCarrito();
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    api.get(`/productos/${id}`)
      .then(({ data }) => setProducto(data))
      .catch(() => setProducto(null));
  }, [id]);

  if (!producto) {
    return <div className="container loading">⏳ Cargando producto...</div>;
  }

  const handleAgregar = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await agregar(producto.id, cantidad);
      setMensaje({ tipo: 'success', texto: `✓ ${cantidad} unidad(es) agregadas al carrito` });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error' });
    }
  };

  const sinStock = producto.stock <= 0;

  return (
    <div className="container">
      <Link to="/" className="btn btn-ghost" style={{ marginBottom: 16 }}>← Volver al catálogo</Link>
      {mensaje && <div className={`alert alert-${mensaje.tipo}`}>{mensaje.texto}</div>}

      <div className="producto-detail">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.descripcion} />
        ) : (
          <div className="producto-img-placeholder" style={{ height: 400, borderRadius: 12 }}>
            {iconoCategoria(producto.categoria)}
          </div>
        )}
        <div>
          <div className="producto-cat" style={{ fontSize: 13 }}>
            {iconoCategoria(producto.categoria)} {labelCategoria(producto.categoria)}
          </div>
          <div className="producto-codigo" style={{ fontSize: 13 }}>Código: {producto.codigo}</div>
          <h2 style={{ margin: '12px 0', color: 'var(--azul-profundo)' }}>{producto.descripcion}</h2>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--azul-profundo)', margin: '20px 0' }}>
            {formatearPrecio(producto.precio_lista)}
          </div>
          <div style={{ marginBottom: 20 }}>
            {sinStock ? (
              <span className="stock-cero">✕ Sin stock disponible</span>
            ) : (
              <span className="stock-ok">✓ {producto.stock} unidades disponibles</span>
            )}
          </div>

          {!sinStock && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Cantidad:</label>
              <input
                type="number"
                min="1"
                max={producto.stock}
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, Math.min(producto.stock, parseInt(e.target.value) || 1)))}
                style={{ width: 80 }}
              />
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleAgregar}
            disabled={sinStock}
            style={{ fontSize: 16, padding: '14px 28px' }}
          >
            🛒 Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
