import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import ProductoCard from '../components/ProductoCard';
import { CATEGORIAS, formatearPrecio } from '../utils/helpers';

export default function Catalogo() {
  const [featured, setFeatured] = useState(null);
  const [bestsellers, setBestsellers] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const { user } = useAuth();
  const { agregar } = useCarrito();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [searchReadOnly, setSearchReadOnly] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSearchReadOnly(false), 300);
    return () => clearTimeout(t);
  }, []);

  // Carga el producto destacado y los bestsellers desde la API
  useEffect(() => {
    api.get('/productos', { params: { destacado: true } })
      .then(({ data }) => setFeatured(data[0] || null));
    api.get('/productos', { params: { bestseller: true } })
      .then(({ data }) => setBestsellers(data));
  }, []);

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
    if (!user) { navigate('/login'); return; }
    try {
      await agregar(id, 1);
      setMensaje({ tipo: 'success', texto: '¡Producto agregado al carrito! 🎣' });
      setTimeout(() => setMensaje(null), 2500);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al agregar' });
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const scrollToCatalogo = () => {
    const el = document.getElementById('catalogo');
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  return (
    <>
      {/* Promo bar */}
      <div className="promo-bar">
        <span>◆ Envío gratis en compras +$3.000</span>
        <span>◆ Hasta 6 cuotas sin interés</span>
        <span>◆ Retiro en Colonia · mismo día</span>
      </div>

      {/* Hero */}
      <section className="hero">
        <span className="hero-tag">◆ Colonia · Uruguay · Desde 2018</span>
        <h1>Bienvenidos a la<br/>casa del <em>Locu Viejo.</em></h1>
        <p>Todo el equipamiento que necesitás para tu próxima jornada en el agua. Cañas, reeles, líneas, señuelos y mucho más.</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={scrollToCatalogo} style={{ fontSize: 15, padding: '13px 22px' }}>
            Ver catálogo →
          </button>
          <a href="https://wa.me/598099539365" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: 15, padding: '13px 22px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Consultá por WhatsApp
          </a>
        </div>
      </section>

      {/* Trust bar */}
      <div className="trust-bar">
        <div className="trust-inner">
          <div className="trust-item">
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <div><strong>Envíos a todo Uruguay</strong><span>DAC · Mirtrans · Retiro local</span></div>
          </div>
          <div className="trust-item">
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div><strong>Pago seguro</strong><span>Mercado Pago · hasta 6 cuotas</span></div>
          </div>
          <div className="trust-item">
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <div><strong>Asesoramiento</strong><span>De pescador a pescador</span></div>
          </div>
          <div className="trust-item">
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 4s2 0 2 4-2 4-2 4M6 4S4 4 4 8s2 4 2 4M6 12c0 4 2.5 6 6 8 3.5-2 6-4 6-8"/><path d="M6 12V8l6-4 6 4v4"/></svg>
            <div><strong>Probado en agua</strong><span>Si lo vendemos, lo usamos</span></div>
          </div>
        </div>
      </div>

      {/* Featured product hero */}
      {featured && (
        <section className="shop-hero-section container">
          <div className="shop-hero-media">
            {featured.imagen_url ? (
              <img src={featured.imagen_url} alt={featured.descripcion} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'contain', background: 'var(--bg-elev)', borderRadius: 'var(--r-xl)', padding: 12 }}/>
            ) : (
              <div className="placeholder" style={{ aspectRatio: '4/3', borderRadius: 'var(--r-xl)', fontSize: 12 }}>
                FOTO PRODUCTO DESTACADO<br/>{featured.descripcion}
              </div>
            )}
            <div className="shop-hero-badge">★ DESTACADO</div>
          </div>
          <div className="shop-hero-info">
            <div className="shop-hero-sku">{featured.categoria?.toUpperCase()} · {featured.codigo}</div>
            <h2 className="shop-hero-name">{featured.descripcion}</h2>
            <div className="shop-hero-stock">
              {featured.stock <= 0
                ? <span style={{ color: 'var(--danger)' }}>✕ Sin stock</span>
                : featured.stock < 5
                  ? <span style={{ color: 'var(--ember)' }}>⚠ Últimas {featured.stock} unidades</span>
                  : <span style={{ color: 'var(--ok)' }}>✓ En stock</span>
              }
            </div>
            <div className="shop-hero-price">
              <span>{formatearPrecio(featured.precio_lista)}</span>
              <span className="shop-hero-currency">UYU</span>
            </div>
            <div className="shop-hero-actions">
              <button
                className="btn btn-primary"
                style={{ fontSize: 16, padding: '15px', width: '100%', justifyContent: 'center' }}
                onClick={() => handleAgregar(featured.id)}
                disabled={featured.stock <= 0}
              >
                🛒 Agregar al carrito
              </button>
              <a href="https://wa.me/598099539365" target="_blank" rel="noopener noreferrer"
                className="btn btn-outline" style={{ fontSize: 14, width: '100%', justifyContent: 'center' }}>
                Consultar por WhatsApp
              </a>
            </div>
            <div className="shop-hero-mini-trust">
              <span>🚚 Envío a todo UY</span>
              <span>🔒 Pago seguro</span>
              <span>🐟 Probado en el río</span>
            </div>
          </div>
        </section>
      )}

      {/* Visual categories grid */}
      <section className="container" style={{ paddingBottom: 0 }}>
        <div className="cat-grid">
          <button
            className={`cat-grid-btn${categoria === '' ? ' active' : ''}`}
            onClick={() => { setCategoria(''); scrollToCatalogo(); }}
          >
            <span className="cat-grid-icon">🌊</span>
            <span className="cat-grid-label">Todos</span>
          </button>
          {CATEGORIAS.map(c => (
            <button
              key={c.value}
              className={`cat-grid-btn${categoria === c.value ? ' active' : ''}`}
              onClick={() => { setCategoria(c.value); scrollToCatalogo(); }}
            >
              <span className="cat-grid-icon">{c.icon}</span>
              <span className="cat-grid-label">{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="container bestsellers-section">
          <div className="bestsellers-header">
            <div>
              <div className="section-kicker">Más vendidos esta semana</div>
              <h2 className="bestsellers-title">Los favoritos del locu</h2>
            </div>
            <button className="btn btn-outline" style={{ fontSize: 13, padding: '8px 16px' }} onClick={scrollToCatalogo}>
              Ver todo →
            </button>
          </div>
          <div className="bestsellers-grid">
            {bestsellers.map(p => (
              <ProductoCard key={p.id} producto={p} onAgregar={handleAgregar} />
            ))}
          </div>
        </section>
      )}

      {/* Full catalog with sticky toolbar */}
      <section className="container" id="catalogo" style={{ paddingBottom: 60 }}>
        <div className="catalog-toolbar">
          <div className="catalog-toolbar-title">
            <h2>
              {categoria ? CATEGORIAS.find(c => c.value === categoria)?.label : 'Catálogo completo'}
              <span className="catalog-count">
                {productos.length} producto{productos.length !== 1 ? 's' : ''}
                {busqueda && <span style={{ color: 'var(--accent)' }}> · "{busqueda}"</span>}
              </span>
            </h2>
          </div>
          <form className="catalog-search" onSubmit={handleBuscar}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: 'var(--muted)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, código..."
              ref={searchRef}
              readOnly={searchReadOnly}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button type="button" onClick={() => { setBusqueda(''); cargar(); }} style={{ color: 'var(--muted)', fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
            )}
          </form>
          <div className="pills">
            <button className={`pill${categoria === '' ? ' active' : ''}`} onClick={() => setCategoria('')}>
              Todos
            </button>
            {CATEGORIAS.map(c => (
              <button key={c.value} className={`pill${categoria === c.value ? ' active' : ''}`} onClick={() => setCategoria(c.value)}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {mensaje && <div className={`alert alert-${mensaje.tipo}`} style={{ marginBottom: 16 }}>{mensaje.texto}</div>}

        {loading ? (
          <div className="loading">⏳ Preparando los aparejos...</div>
        ) : productos.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🎣</div>
            <h3>No hay productos disponibles</h3>
            <p>Probá con otra categoría o búsqueda</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
              <button className="btn btn-outline" onClick={() => { setBusqueda(''); setCategoria(''); }}>Ver todos</button>
              <a href="https://wa.me/598099539365" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="productos-grid">
            {productos.map(p => (
              <ProductoCard key={p.id} producto={p} onAgregar={handleAgregar} />
            ))}
          </div>
        )}
      </section>

      {/* Club section */}
      <section className="club-section" id="nosotros">
        <div className="section-kicker">El Club</div>
        <h2 className="club-heading">Pasión de amigos</h2>
        <p className="club-desc">
          Somos cuatro amigos de Colonia que un día dejamos de contarnos anécdotas de pesca y arrancamos a vivirlas. Tres lanchas, un mazo de cartas marcado, y una tienda donde conseguís lo que de verdad funciona en el Río de la Plata.
        </p>
        <p className="club-sub">
          Si tenés dudas sobre qué llevar, escribinos. Te recomendamos de pescador a pescador — sin venderte humo.
        </p>
      </section>
    </>
  );
}
