-- Agrega columnas destacado y bestseller a productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS destacado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS bestseller BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_productos_destacado ON productos(destacado) WHERE destacado = TRUE;
CREATE INDEX IF NOT EXISTS idx_productos_bestseller ON productos(bestseller) WHERE bestseller = TRUE;
