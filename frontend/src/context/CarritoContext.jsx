import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refrescar = useCallback(async () => {
    if (!user) {
      setItems([]);
      setTotal(0);
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get('/carrito');
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error cargando carrito:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refrescar();
  }, [refrescar]);

  const agregar = async (producto_id, cantidad = 1) => {
    await api.post('/carrito/items', { producto_id, cantidad });
    await refrescar();
  };

  const actualizar = async (itemId, cantidad) => {
    await api.put(`/carrito/items/${itemId}`, { cantidad });
    await refrescar();
  };

  const eliminar = async (itemId) => {
    await api.delete(`/carrito/items/${itemId}`);
    await refrescar();
  };

  const vaciar = async () => {
    await api.delete('/carrito');
    await refrescar();
  };

  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);

  return (
    <CarritoContext.Provider value={{
      items, total, loading, cantidadTotal,
      agregar, actualizar, eliminar, vaciar, refrescar
    }}>
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => useContext(CarritoContext);
