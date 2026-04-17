export const CATEGORIAS = [
  { value: 'canas', label: 'Cañas', icon: '🎣' },
  { value: 'reeles', label: 'Reeles', icon: '🌀' },
  { value: 'lineas', label: 'Líneas', icon: '〰️' },
  { value: 'anzuelos', label: 'Anzuelos', icon: '🪝' },
  { value: 'plomos', label: 'Plomos', icon: '⚪' },
  { value: 'senuelos', label: 'Señuelos', icon: '🐟' },
  { value: 'accesorios', label: 'Accesorios', icon: '🧰' },
  { value: 'otros', label: 'Otros', icon: '📦' },
];

export const iconoCategoria = (cat) => {
  const c = CATEGORIAS.find(x => x.value === cat);
  return c ? c.icon : '📦';
};

export const labelCategoria = (cat) => {
  const c = CATEGORIAS.find(x => x.value === cat);
  return c ? c.label : cat;
};

export const formatearPrecio = (n) => {
  const num = Number(n) || 0;
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0
  }).format(num);
};

export const formatearFecha = (f) => {
  if (!f) return '-';
  return new Date(f).toLocaleDateString('es-UY', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const DEPARTAMENTOS_UY = [
  'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores',
  'Florida', 'Lavalleja', 'Maldonado', 'Montevideo', 'Paysandú', 'Río Negro',
  'Rivera', 'Rocha', 'Salto', 'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
];
