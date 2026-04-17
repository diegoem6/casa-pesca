-- ============================================
-- Esquema de base de datos: Casa de Pesca
-- ============================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(30),
  rol VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (rol IN ('cliente', 'admin')),
  fecha_alta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT NOT NULL,
  precio_compra DECIMAL(10, 2) NOT NULL CHECK (precio_compra >= 0),
  precio_lista DECIMAL(10, 2) NOT NULL CHECK (precio_lista >= 0),
  categoria VARCHAR(30) NOT NULL CHECK (categoria IN (
    'canas', 'reeles', 'lineas', 'anzuelos', 'plomos', 'senuelos', 'accesorios', 'otros'
  )),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  imagen_url VARCHAR(500),
  fecha_alta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

-- Tabla de carrito (carrito persistente por usuario)
CREATE TABLE IF NOT EXISTS carritos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id)
);

CREATE TABLE IF NOT EXISTS carrito_items (
  id SERIAL PRIMARY KEY,
  carrito_id INTEGER NOT NULL REFERENCES carritos(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  UNIQUE(carrito_id, producto_id)
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (estado IN (
    'pendiente', 'pagado', 'enviado', 'entregado', 'cancelado', 'rechazado'
  )),
  -- Datos de envío
  nombre_envio VARCHAR(100) NOT NULL,
  apellido_envio VARCHAR(100) NOT NULL,
  documento VARCHAR(30) NOT NULL,
  telefono_envio VARCHAR(30) NOT NULL,
  email_envio VARCHAR(150) NOT NULL,
  direccion VARCHAR(250) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  departamento VARCHAR(100) NOT NULL,
  codigo_postal VARCHAR(20),
  pais VARCHAR(50) NOT NULL DEFAULT 'UY',
  notas TEXT,
  -- Datos de pago
  payment_id VARCHAR(100),
  payment_url TEXT,
  payment_method VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_payment ON pedidos(payment_id);

-- Tabla de detalle de pedidos (snapshot del producto al momento de la compra)
CREATE TABLE IF NOT EXISTS pedido_items (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  codigo VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  subtotal DECIMAL(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON pedido_items(pedido_id);
