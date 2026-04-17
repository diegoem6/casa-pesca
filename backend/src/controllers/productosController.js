const db = require('../config/database');

const CATEGORIAS_VALIDAS = ['canas', 'reeles', 'lineas', 'anzuelos', 'plomos', 'senuelos', 'accesorios', 'otros'];

async function listar(req, res, next) {
  try {
    const { categoria, busqueda, soloActivos = 'true' } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (soloActivos === 'true') {
      conditions.push(`activo = TRUE`);
    }
    if (categoria && CATEGORIAS_VALIDAS.includes(categoria)) {
      conditions.push(`categoria = $${idx++}`);
      params.push(categoria);
    }
    if (busqueda) {
      conditions.push(`(LOWER(descripcion) LIKE $${idx} OR LOWER(codigo) LIKE $${idx})`);
      params.push(`%${busqueda.toLowerCase()}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await db.query(
      `SELECT id, codigo, descripcion, precio_lista, categoria, stock, imagen_url, fecha_alta, activo
       FROM productos ${where}
       ORDER BY fecha_alta DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const result = await db.query('SELECT * FROM productos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const producto = result.rows[0];
    // No exponer precio de compra al frontend salvo si es admin
    if (!req.user || req.user.rol !== 'admin') {
      delete producto.precio_compra;
    }
    res.json(producto);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const { codigo, descripcion, precio_compra, precio_lista, categoria, stock = 0 } = req.body;
    const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!CATEGORIAS_VALIDAS.includes(categoria)) {
      return res.status(400).json({ error: 'Categoría inválida' });
    }

    const result = await db.query(
      `INSERT INTO productos (codigo, descripcion, precio_compra, precio_lista, categoria, stock, imagen_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [codigo, descripcion, precio_compra, precio_lista, categoria, stock, imagen_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un producto con ese código' });
    }
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { codigo, descripcion, precio_compra, precio_lista, categoria, stock, activo } = req.body;
    const imagen_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (categoria && !CATEGORIAS_VALIDAS.includes(categoria)) {
      return res.status(400).json({ error: 'Categoría inválida' });
    }

    // Construir UPDATE dinámico
    const fields = [];
    const params = [];
    let idx = 1;
    const setIf = (col, val) => {
      if (val !== undefined && val !== null && val !== '') {
        fields.push(`${col} = $${idx++}`);
        params.push(val);
      }
    };
    setIf('codigo', codigo);
    setIf('descripcion', descripcion);
    setIf('precio_compra', precio_compra);
    setIf('precio_lista', precio_lista);
    setIf('categoria', categoria);
    setIf('stock', stock);
    setIf('imagen_url', imagen_url);
    if (activo !== undefined) {
      fields.push(`activo = $${idx++}`);
      params.push(activo === 'true' || activo === true);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Sin cambios para aplicar' });
    }

    params.push(id);
    const result = await db.query(
      `UPDATE productos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un producto con ese código' });
    }
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    // Soft delete: marcar como inactivo
    const result = await db.query(
      'UPDATE productos SET activo = FALSE WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ ok: true, mensaje: 'Producto desactivado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, CATEGORIAS_VALIDAS };
