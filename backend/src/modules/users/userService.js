const bcrypt = require('bcryptjs');
const pool = require('../../config/db');

async function listUsers() {
  const result = await pool.query(
    'SELECT id, username, rol, nombre, activo, created_at FROM usuarios ORDER BY id'
  );
  return result.rows;
}

async function createUser(data) {
  const hash = await bcrypt.hash(data.password, 10);
  const result = await pool.query(
    `INSERT INTO usuarios (username, password, rol, nombre, activo)
     VALUES ($1, $2, $3, $4, COALESCE($5, true))
     RETURNING id, username, rol, nombre, activo, created_at`,
    [data.username, hash, data.rol || 'recepcionista', data.nombre, data.activo]
  );
  return result.rows[0];
}

module.exports = { listUsers, createUser };
