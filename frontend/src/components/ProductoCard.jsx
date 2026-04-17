import { Link } from 'react-router-dom';
import { formatearPrecio, iconoCategoria, labelCategoria } from '../utils/helpers';

export default function ProductoCard({ producto, onAgregar }) {
  const sinStock = producto.stock <= 0;
  const stockBajo = producto.stock > 0 && producto.stock < 5;

  return (
    <div className="producto-card">
      <Link to={`/producto/${producto.id}`}>
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.descripcion} className="producto-img" />
        ) : (
          <div className="producto-img-placeholder">{iconoCategoria(producto.categoria)}</div>
        )}
      </Link>
      <div className="producto-body">
        <div className="producto-cat">{labelCategoria(producto.categoria)}</div>
        <div className="producto-codigo">{producto.codigo}</div>
        <Link to={`/producto/${producto.id}`} style={{ color: 'inherit' }}>
          <div className="producto-desc">{producto.descripcion}</div>
        </Link>
        <div className="producto-precio">{formatearPrecio(producto.precio_lista)}</div>
        <div className={`producto-stock ${sinStock ? 'stock-cero' : stockBajo ? 'stock-bajo' : 'stock-ok'}`}>
          {sinStock ? '✕ Sin stock' : stockBajo ? `⚠ Últimas ${producto.stock} unidades` : `✓ ${producto.stock} en stock`}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onAgregar(producto.id)}
          disabled={sinStock}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          🛒 Agregar
        </button>
      </div>
    </div>
  );
}
