import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function DevPago() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pedidoId = searchParams.get('pedido');
  const [cargando, setCargando] = useState(false);

  async function simular(resultado) {
    setCargando(true);
    try {
      await api.post(`/pedidos/dev-simular/${pedidoId}`, { resultado });
      if (resultado === 'aprobado') {
        navigate(`/checkout/success?pedido=${pedidoId}`);
      } else {
        navigate(`/checkout/cancel?pedido=${pedidoId}`);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error simulando pago');
      setCargando(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 60 }}>
      <div style={{ background: '#fff3cd', border: '2px dashed #f0ad4e', borderRadius: 12, padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
        <h2 style={{ color: '#856404', marginBottom: 8 }}>Simulador de pago (dev)</h2>
        <p style={{ color: '#856404', marginBottom: 6, fontSize: 14 }}>
          Este panel solo existe en desarrollo. Simulá el resultado del pago sin pasar por Mercado Pago.
        </p>
        <p style={{ color: '#856404', marginBottom: 24, fontSize: 13 }}>
          Pedido #{pedidoId}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn btn-primary"
            disabled={cargando}
            onClick={() => simular('aprobado')}
            style={{ background: '#28a745', borderColor: '#28a745' }}
          >
            ✅ Simular pago aprobado
          </button>
          <button
            className="btn btn-primary"
            disabled={cargando}
            onClick={() => simular('rechazado')}
            style={{ background: '#dc3545', borderColor: '#dc3545' }}
          >
            ❌ Simular pago rechazado
          </button>
          <button
            className="btn"
            disabled={cargando}
            onClick={() => simular('cancelado')}
            style={{ background: '#6c757d', color: 'white', borderColor: '#6c757d' }}
          >
            🚫 Simular pago cancelado
          </button>
        </div>
      </div>
    </div>
  );
}
