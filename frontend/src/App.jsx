import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Catalogo from './pages/Catalogo';
import ProductoDetalle from './pages/ProductoDetalle';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import CheckoutResult from './pages/CheckoutResult';
import DevPago from './pages/DevPago';
import Login from './pages/Login';
import Registro from './pages/Registro';
import MisPedidos from './pages/MisPedidos';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Catalogo />} />
              <Route path="/producto/:id" element={<ProductoDetalle />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/carrito" element={<PrivateRoute><Carrito /></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
              <Route path="/checkout/success" element={<PrivateRoute><CheckoutResult tipo="success" /></PrivateRoute>} />
              <Route path="/checkout/cancel" element={<PrivateRoute><CheckoutResult tipo="cancel" /></PrivateRoute>} />
              <Route path="/checkout/dev-pago" element={<PrivateRoute><DevPago /></PrivateRoute>} />
              <Route path="/mis-pedidos" element={<PrivateRoute><MisPedidos /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
              <Route path="*" element={
                <div className="container empty">
                  <div className="empty-icon">🌊</div>
                  <h2>Esta página se hundió</h2>
                  <p>404 - La página que buscás no existe</p>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
