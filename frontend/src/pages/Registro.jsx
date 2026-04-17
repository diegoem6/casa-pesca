import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Registro() {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', telefono: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registro(form);
      navigate('/');
    } catch (err) {
      const detalles = err.response?.data?.detalles;
      setError(detalles ? detalles.map(d => d.mensaje).join(', ') : (err.response?.data?.error || 'Error al registrarse'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-card">
        <div style={{ textAlign: 'center', fontSize: 50, marginBottom: 10 }}>⚓</div>
        <h2>Sumate a la tripulación</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input value={form.apellido} onChange={(e) => setForm({...form, apellido: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Teléfono (opcional)</label>
            <input value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Contraseña (mín. 6 caracteres)</label>
            <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? '⏳ Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          ¿Ya tenés cuenta? <Link to="/login">Ingresá aquí</Link>
        </p>
      </div>
    </div>
  );
}
