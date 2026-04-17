import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { formatearPrecio, formatearFecha } from '../utils/helpers';

export default function CheckoutResult({ tipo }) {
  const [params] = useSearchParams();
  const pedidoId = params.get('pedido');
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    if (pedidoId) {
      api.get(`/pedidos/${pedidoId}`).then(({ data }) => setPedido(data)).catch(() => {});
    }
  }, [pedidoId]);

  const exito = tipo === 'success';

  return (
    <div className="container">
      <div style={{ background: 'var(--carta)', padding: 40, borderRadius: 14, boxShadow: 'var(--shadow-md)', textAlign: 'center', maxWidth: 600, margin: '40px auto' }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>{exito ? '🎣' : '⚠️'}</div>
        <h2 style={{ color: exito ? 'var(--verde-alga)' : 'var(--rojo-coral)', marginBottom: 12 }}>
          {exito ? '¡Pesca exitosa!' : 'Pago cancelado'}
        </h2>
        <p style={{ color: 'var(--texto-sec)', marginBottom: 20 }}>
          {exito
            ? 'Tu pedido fue recibido. En breve recibirás la confirmación por email cuando el pago se acredite.'
            : 'El pago fue cancelado o no pudo completarse. Tu pedido quedó pendiente, podés reintentar el pago desde Mis Pedidos.'}
        </p>

        {pedido && (
          <div style={{ background: 'var(--espuma)', padding: 16, borderRadius: 10, marginBottom: 20, textAlign: 'left' }}>
            <div><strong>Pedido #{pedido.id}</strong></div>
            <div style={{ fontSize: 13, color: 'var(--texto-sec)' }}>{formatearFecha(pedido.fecha)}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--dorado)', marginTop: 6 }}>
              {formatearPrecio(pedido.total)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link to="/mis-pedidos" className="btn btn-primary">📋 Ver mis pedidos</Link>
          <Link to="/" className="btn btn-outline">🌊 Seguir comprando</Link>
        </div>
      </div>
    </div>
  );
}
