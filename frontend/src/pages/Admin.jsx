import { useState, useEffect } from 'react';
import api from '../services/api';
import { CATEGORIAS, formatearPrecio, formatearFecha, labelCategoria } from '../utils/helpers';

export default function Admin() {
  const [tab, setTab] = useState('productos');

  return (
    <div className="container">
      <h2 style={{ marginBottom: 20, color: 'var(--naranja)' }}>⚓ Panel de administración</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '2px solid var(--borde)' }}>
        <button
          className={`btn-ghost ${tab === 'productos' ? '' : ''}`}
          onClick={() => setTab('productos')}
          style={{
            borderBottom: tab === 'productos' ? '3px solid var(--naranja)' : 'none',
            borderRadius: 0,
            color: tab === 'productos' ? 'var(--azul-profundo)' : 'var(--gris-niebla)',
            fontWeight: tab === 'productos' ? 700 : 500,
            padding: '10px 20px'
          }}
        >
          🎣 Productos
        </button>
        <button
          onClick={() => setTab('pedidos')}
          className="btn-ghost"
          style={{
            borderBottom: tab === 'pedidos' ? '3px solid var(--naranja)' : 'none',
            borderRadius: 0,
            color: tab === 'pedidos' ? 'var(--azul-profundo)' : 'var(--gris-niebla)',
            fontWeight: tab === 'pedidos' ? 700 : 500,
            padding: '10px 20px'
          }}
        >
          📋 Pedidos
        </button>
      </div>

      {tab === 'productos' ? <AdminProductos /> : <AdminPedidos />}
    </div>
  );
}

// ============ Productos ============

function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null); // null | {} (nuevo) | producto (editar)
  const [mensaje, setMensaje] = useState(null);

  const cargar = async () => {
    setLoading(true);
    const { data } = await api.get('/productos', { params: { soloActivos: false } });
    setProductos(data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const eliminar = async (id) => {
    if (!confirm('¿Desactivar este producto?')) return;
    await api.delete(`/productos/${id}`);
    setMensaje({ tipo: 'success', texto: 'Producto desactivado' });
    cargar();
    setTimeout(() => setMensaje(null), 2500);
  };

  return (
    <div>
      {mensaje && <div className={`alert alert-${mensaje.tipo}`}>{mensaje.texto}</div>}

      <div className="admin-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--naranja)' }}>{productos.length} productos</h3>
        <button onClick={() => setEditando({})} className="btn btn-primary">+ Nuevo producto</button>
      </div>

      {editando !== null && (
        <FormProducto
          producto={editando.id ? editando : null}
          onCancel={() => setEditando(null)}
          onSave={() => {
            setEditando(null);
            setMensaje({ tipo: 'success', texto: 'Producto guardado correctamente' });
            cargar();
            setTimeout(() => setMensaje(null), 2500);
          }}
        />
      )}

      {loading ? (
        <div className="loading">⏳ Cargando...</div>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>P. Compra</th>
                <th>P. Lista</th>
                <th>Stock</th>
                <th>Flags</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id} style={{ opacity: p.activo ? 1 : 0.5 }}>
                  <td><strong>{p.codigo}</strong></td>
                  <td style={{ fontSize: 13, maxWidth: 280 }}>{p.descripcion}</td>
                  <td>{labelCategoria(p.categoria)}</td>
                  <td>{p.precio_compra ? formatearPrecio(p.precio_compra) : '-'}</td>
                  <td><strong>{formatearPrecio(p.precio_lista)}</strong></td>
                  <td>
                    <span className={p.stock === 0 ? 'stock-cero' : p.stock < 5 ? 'stock-bajo' : 'stock-ok'}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {p.destacado && <span className="badge badge-pendiente" title="Destacado">⭐</span>}
                    {p.bestseller && <span className="badge badge-enviado" title="Bestseller" style={{ marginLeft: 4 }}>🔥</span>}
                  </td>
                  <td>
                    {p.activo
                      ? <span className="badge badge-pagado">Activo</span>
                      : <span className="badge badge-cancelado">Inactivo</span>}
                  </td>
                  <td>
                    <button onClick={() => setEditando(p)} className="btn-ghost">✏️</button>
                    {p.activo && (
                      <button onClick={() => eliminar(p.id)} className="btn-ghost" style={{ color: 'var(--rojo-coral)' }}>🗑</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============ Form de producto ============

function FormProducto({ producto, onCancel, onSave }) {
  const [form, setForm] = useState({
    codigo: producto?.codigo || '',
    descripcion: producto?.descripcion || '',
    precio_compra: producto?.precio_compra ?? '',
    precio_lista: producto?.precio_lista ?? '',
    categoria: producto?.categoria || 'canas',
    stock: producto?.stock ?? 0,
    activo: producto?.activo ?? true,
    destacado: producto?.destacado ?? false,
    bestseller: producto?.bestseller ?? false,
  });
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imagen) fd.append('imagen', imagen);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (producto) {
        await api.put(`/productos/${producto.id}`, fd, config);
      } else {
        await api.post('/productos', fd, config);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--carta)', borderRadius: 14, padding: 30, maxWidth: 600, width: '100%',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ color: 'var(--naranja)' }}>
            {producto ? '✏️ Editar producto' : '➕ Nuevo producto'}
          </h3>
          <button onClick={onCancel} className="btn-ghost">✕</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Código *</label>
              <input value={form.codigo} onChange={(e) => setForm({...form, codigo: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Categoría *</label>
              <select value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})}>
                {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Descripción *</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({...form, descripcion: e.target.value})} rows="3" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio de compra *</label>
              <input type="number" step="0.01" min="0" value={form.precio_compra}
                onChange={(e) => setForm({...form, precio_compra: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Precio de lista *</label>
              <input type="number" step="0.01" min="0" value={form.precio_lista}
                onChange={(e) => setForm({...form, precio_lista: e.target.value})} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stock</label>
              <input type="number" min="0" value={form.stock}
                onChange={(e) => setForm({...form, stock: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Activo</label>
              <select value={form.activo} onChange={(e) => setForm({...form, activo: e.target.value === 'true'})}>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className="form-row" style={{ gap: 24, marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 500 }}>
              <input type="checkbox" checked={form.destacado}
                onChange={(e) => setForm({...form, destacado: e.target.checked})}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              ⭐ Producto destacado
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 500 }}>
              <input type="checkbox" checked={form.bestseller}
                onChange={(e) => setForm({...form, bestseller: e.target.checked})}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              🔥 Bestseller
            </label>
          </div>

          <div className="form-group">
            <label>Imagen (jpg, png, webp - máx 5MB)</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImagen(e.target.files[0])} />
            {producto?.imagen_url && !imagen && (
              <img src={producto.imagen_url} alt="" style={{ maxWidth: 120, marginTop: 8, borderRadius: 8 }} />
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} className="btn btn-outline">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? '⏳ Guardando...' : '💾 Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ Pedidos ============

function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [detalle, setDetalle] = useState(null);

  const cargar = async () => {
    setLoading(true);
    const params = filtroEstado ? { estado: filtroEstado } : {};
    const { data } = await api.get('/pedidos', { params });
    setPedidos(data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [filtroEstado]);

  const cambiarEstado = async (id, estado) => {
    await api.patch(`/pedidos/${id}/estado`, { estado });
    cargar();
    if (detalle?.id === id) {
      const { data } = await api.get(`/pedidos/${id}`);
      setDetalle(data);
    }
  };

  const ESTADOS = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado', 'rechazado'];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <label style={{ fontWeight: 600 }}>Filtrar por estado:</label>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ width: 'auto' }}>
          <option value="">Todos</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading">⏳ Cargando pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div className="empty"><div className="empty-icon">📋</div><p>Sin pedidos</p></div>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>#</th><th>Fecha</th><th>Cliente</th><th>Email</th>
                <th>Total</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => (
                <tr key={p.id}>
                  <td><strong>#{p.id}</strong></td>
                  <td style={{ fontSize: 13 }}>{formatearFecha(p.fecha)}</td>
                  <td>{p.nombre_envio} {p.apellido_envio}</td>
                  <td style={{ fontSize: 13 }}>{p.email}</td>
                  <td><strong>{formatearPrecio(p.total)}</strong></td>
                  <td><span className={`badge badge-${p.estado}`}>{p.estado}</span></td>
                  <td>
                    <button onClick={async () => {
                      const { data } = await api.get(`/pedidos/${p.id}`);
                      setDetalle(data);
                    }} className="btn-ghost">Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detalle && (
        <div onClick={() => setDetalle(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--carta)', borderRadius: 14, padding: 30, maxWidth: 700, width: '100%',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ color: 'var(--naranja)' }}>Pedido #{detalle.id}</h3>
              <button onClick={() => setDetalle(null)} className="btn-ghost">✕</button>
            </div>

            <div style={{ marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`badge badge-${detalle.estado}`}>{detalle.estado}</span>
              <span style={{ color: 'var(--texto-sec)', fontSize: 13 }}>
                {formatearFecha(detalle.fecha)}
              </span>
              <select
                value={detalle.estado}
                onChange={(e) => cambiarEstado(detalle.id, e.target.value)}
                style={{ width: 'auto', marginLeft: 'auto' }}
              >
                {ESTADOS.map(e => <option key={e} value={e}>Cambiar a: {e}</option>)}
              </select>
            </div>

            <div style={{ background: 'var(--espuma)', padding: 14, borderRadius: 8, marginBottom: 14 }}>
              <h4 style={{ color: 'var(--naranja)', marginBottom: 6 }}>📍 Envío</h4>
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                <strong>{detalle.nombre_envio} {detalle.apellido_envio}</strong> · CI: {detalle.documento}<br/>
                ✉️ {detalle.email_envio} · 📞 {detalle.telefono_envio}<br/>
                📍 {detalle.direccion}, {detalle.ciudad}, {detalle.departamento} {detalle.codigo_postal}<br/>
                {detalle.notas && <>📝 <em>{detalle.notas}</em></>}
              </p>
            </div>

            <h4 style={{ marginBottom: 8, color: 'var(--naranja)' }}>📦 Productos</h4>
            <table className="tabla">
              <thead>
                <tr><th>Código</th><th>Producto</th><th>Cant.</th><th>P. Unit.</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {detalle.items?.map(it => (
                  <tr key={it.id}>
                    <td style={{ fontSize: 12 }}>{it.codigo}</td>
                    <td style={{ fontSize: 13 }}>{it.descripcion}</td>
                    <td>{it.cantidad}</td>
                    <td>{formatearPrecio(it.precio_unitario)}</td>
                    <td><strong>{formatearPrecio(it.subtotal)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="carrito-total" style={{ fontSize: 22, marginTop: 14 }}>
              <span>Total</span>
              <span>{formatearPrecio(detalle.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
