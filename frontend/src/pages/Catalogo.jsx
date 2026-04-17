import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import ProductoCard from '../components/ProductoCard';
import { CATEGORIAS } from '../utils/helpers';

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const { user } = useAuth();
  const { agregar } = useCarrito();
  const navigate = useNavigate();

  const cargar = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoria) params.categoria = categoria;
      if (busqueda) params.busqueda = busqueda;
      const { data } = await api.get('/productos', { params });
      setProductos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [categoria]);

  const handleBuscar = (e) => {
    e.preventDefault();
    cargar();
  };

  const handleAgregar = async (id) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await agregar(id, 1);
      setMensaje({ tipo: 'success', texto: '¡Producto agregado al carrito! 🎣' });
      setTimeout(() => setMensaje(null), 2500);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al agregar' });
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  return (
    <div className="container">
      <section className="hero">
        <h1>🎣 Bienvenidos a la casa del Locu Viejo</h1>
        <p>Todo el equipamiento que necesitás para tu próxima jornada en el agua. Cañas, reeles, líneas, señuelos y mucho más.</p>
      </section>

      {mensaje && <div className={`alert alert-${mensaje.tipo}`}>{mensaje.texto}</div>}

      <form className="search-box" onSubmit={handleBuscar}>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Buscar</button>
      </form>

      <div className="categorias">
        <button
          className={`cat-btn ${categoria === '' ? 'active' : ''}`}
          onClick={() => setCategoria('')}
        >
          🌊 Todos
        </button>
        {CATEGORIAS.map(c => (
          <button
            key={c.value}
            className={`cat-btn ${categoria === c.value ? 'active' : ''}`}
            onClick={() => setCategoria(c.value)}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">⏳ Preparando los aparejos...</div>
      ) : productos.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🎣</div>
          <h3>No hay productos disponibles</h3>
          <p>Probá con otra categoría o búsqueda</p>
        </div>
      ) : (
        <div className="productos-grid">
          {productos.map(p => (
            <ProductoCard key={p.id} producto={p} onAgregar={handleAgregar} />
          ))}
        </div>
      )}
    </div>
  );
}
