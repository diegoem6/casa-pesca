import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cantidadTotal } = useCarrito();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <img src="/logo.png" alt="El Locu Viejo" style={{ height: 46, width: 'auto', borderRadius: 6 }} />
          <span>El Locu Viejo</span>
        </Link>
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
              <Link to="/registro" className="nav-link" style={{ background: 'var(--amarillo-señuelo)', color: 'var(--azul-profundo)', fontWeight: 700 }}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
