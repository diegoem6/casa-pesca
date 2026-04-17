const bcrypt = require('bcryptjs');
const db = require('../config/database');
require('dotenv').config();

const productosEjemplo = [
  { codigo: 'CAN-001', descripcion: 'Caña Shimano Sienna 7\' 2 tramos - Ideal para pesca costera', precio_compra: 1800, precio_lista: 2900, categoria: 'canas', stock: 12 },
  { codigo: 'CAN-002', descripcion: 'Caña Daiwa Crossfire 6\'6" - Acción media, fibra de carbono', precio_compra: 2400, precio_lista: 3800, categoria: 'canas', stock: 8 },
  { codigo: 'REE-001', descripcion: 'Reel Shimano Sienna 2500 FG - 4 rulemanes, frente delantero', precio_compra: 2200, precio_lista: 3500, categoria: 'reeles', stock: 10 },
  { codigo: 'REE-002', descripcion: 'Reel Daiwa Sweepfire 3000 - 1 rulemán, ratio 5.3:1', precio_compra: 1500, precio_lista: 2400, categoria: 'reeles', stock: 15 },
  { codigo: 'LIN-001', descripcion: 'Línea monofilamento Sufix Tritanium 0.30mm x 300m', precio_compra: 450, precio_lista: 750, categoria: 'lineas', stock: 30 },
  { codigo: 'LIN-002', descripcion: 'Multifilamento PowerPro 30lb x 150m verde', precio_compra: 900, precio_lista: 1500, categoria: 'lineas', stock: 20 },
  { codigo: 'ANZ-001', descripcion: 'Anzuelos Mustad 92247 N°2/0 - Caja x 50', precio_compra: 350, precio_lista: 600, categoria: 'anzuelos', stock: 25 },
  { codigo: 'ANZ-002', descripcion: 'Anzuelos circulares Owner SSW 5/0 - Pack x 10', precio_compra: 280, precio_lista: 450, categoria: 'anzuelos', stock: 40 },
  { codigo: 'PLO-001', descripcion: 'Plomos pera con vástago 30g - Pack x 10', precio_compra: 200, precio_lista: 350, categoria: 'plomos', stock: 50 },
  { codigo: 'PLO-002', descripcion: 'Plomada de río 60g - Pack x 5', precio_compra: 180, precio_lista: 300, categoria: 'plomos', stock: 35 },
  { codigo: 'SEN-001', descripcion: 'Señuelo Rapala Original Floating F09 - Trucha plata', precio_compra: 850, precio_lista: 1400, categoria: 'senuelos', stock: 18 },
  { codigo: 'SEN-002', descripcion: 'Jig Vibration 14g - Color chartreuse, ideal pejerrey', precio_compra: 320, precio_lista: 550, categoria: 'senuelos', stock: 22 },
  { codigo: 'ACC-001', descripcion: 'Caja organizadora Plano 3700 - 4 compartimentos ajustables', precio_compra: 600, precio_lista: 1000, categoria: 'accesorios', stock: 14 },
  { codigo: 'ACC-002', descripcion: 'Pinza de acero inoxidable 17cm con liberador de anzuelos', precio_compra: 350, precio_lista: 600, categoria: 'accesorios', stock: 25 },
  { codigo: 'OTR-001', descripcion: 'Buzo térmico para pesca talla L - Color verde militar', precio_compra: 1500, precio_lista: 2500, categoria: 'otros', stock: 6 },
];

async function seed() {
  try {
    console.log('→ Creando admin inicial...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@casapesca.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, rol)
       VALUES ($1, $2, $3, $4, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      ['Administrador', 'Casa de Pesca', adminEmail, passwordHash]
    );
    console.log(`✓ Admin: ${adminEmail} / ${adminPassword}`);

    console.log('\n→ Insertando productos de ejemplo...');
    for (const p of productosEjemplo) {
      await db.query(
        `INSERT INTO productos (codigo, descripcion, precio_compra, precio_lista, categoria, stock)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (codigo) DO NOTHING`,
        [p.codigo, p.descripcion, p.precio_compra, p.precio_lista, p.categoria, p.stock]
      );
    }
    console.log(`✓ ${productosEjemplo.length} productos insertados`);

    console.log('\n✓ Seed completado');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error en seed:', err.message);
    process.exit(1);
  }
}

seed();
