const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`→ Ejecutando ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await db.query(sql);
      console.log(`✓ ${file} OK`);
    }

    console.log('\n✓ Todas las migraciones ejecutadas correctamente');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error en migraciones:', err.message);
    process.exit(1);
  }
}

runMigrations();
