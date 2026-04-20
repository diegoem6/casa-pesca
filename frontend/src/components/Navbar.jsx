import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import LogoMark from './LogoMark';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cantidadTotal } = useCarrito();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Hamburger — mobile only */}
          <button className="icon-btn nav-hamburger" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <Link to="/" className="brand">
            <LogoMark size={38} />
            <span>El Locu Viejo</span>
          </Link>

          <a
            href="https://wa.me/598099539365"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-whatsapp"
            title="Contactanos por WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>

          <div className="nav-links">
            <Link to="/" className="nav-link">
              <span>🏠</span><span className="nav-text">Catálogo</span>
            </Link>
            {user && (
              <>
                <Link to="/mis-pedidos" className="nav-link">
                  <span>📋</span><span className="nav-text">Mis pedidos</span>
                </Link>
                <Link to="/carrito" className="nav-link">
                  <span>🛒</span><span className="nav-text">Carrito</span>
                  {cantidadTotal > 0 && <span className="cart-badge">{cantidadTotal}</span>}
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="nav-link">
                <span>⚓</span><span className="nav-text">Admin</span>
              </Link>
            )}
            {user ? (
              <>
                <span className="nav-link" style={{ opacity: 0.85 }}>
                  <span>👤</span><span className="nav-text">{user.nombre}</span>
                </span>
                <button onClick={handleLogout} className="nav-link" style={{ background: 'transparent', color: '#ff8f8f' }}>
                  <span>🚪</span><span className="nav-text">Salir</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Ingresar</Link>
                <Link to="/registro" className="nav-link" style={{ background: 'var(--accent)', color: 'var(--accent-fg)', fontWeight: 700 }}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-drawer${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)}>
        <div className="mobile-drawer-inner" onClick={e => e.stopPropagation()}>
          <div className="mobile-drawer-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LogoMark size={32} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>El Locu Viejo</span>
            </div>
            <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Cerrar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <nav className="mobile-drawer-nav">
            <Link to="/" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              🏠 Catálogo
            </Link>
            {user && (
              <>
                <Link to="/mis-pedidos" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
                  📋 Mis pedidos
                </Link>
                <Link to="/carrito" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
                  🛒 Carrito {cantidadTotal > 0 && `(${cantidadTotal})`}
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
                ⚓ Admin
              </Link>
            )}
            {user ? (
              <button className="mobile-drawer-link mobile-drawer-link-danger" onClick={handleLogout}>
                🚪 Salir
              </button>
            ) : (
              <>
                <Link to="/login" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>Ingresar</Link>
                <Link to="/registro" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>Registrarse</Link>
              </>
            )}
          </nav>

          <div className="mobile-drawer-footer">
            <div>Colonia del Sacramento · Uruguay</div>
            <div>+598 099 539 365</div>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="mobile-bottom-bar">
        <a href="https://wa.me/598099539365" target="_blank" rel="noopener noreferrer" className="mobile-bottom-btn mobile-bottom-wa">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>
        <Link to="/carrito" className="mobile-bottom-btn mobile-bottom-cart">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/>
          </svg>
          Carrito {cantidadTotal > 0 && `(${cantidadTotal})`}
        </Link>
      </div>
    </>
  );
}
