const pool = require('../../config/db');

async function listClients(search = '') {
  const term = `%${search}%`;
  const result = await pool.query(
    `SELECT * FROM clientes
     WHERE $1 = '%%'
        OR nombres ILIKE $1
        OR apellidos ILIKE $1
        OR telefono ILIKE $1
        OR email ILIKE $1
        OR num_id ILIKE $1
     ORDER BY updated_at DESC, id DESC`,
    [term]
  );
  return result.rows;
}

async function createClient(data) {
  const result = await pool.query(
    `INSERT INTO clientes (nombres, apellidos, telefono, email, num_id)
     VALUES ($1, $2, $3, NULLIF($4, ''), NULLIF($5, ''))
     RETURNING *`,
    [data.nombres, data.apellidos, data.telefono, data.email, data.num_id]
  );
  return result.rows[0];
}

async function updateClient(id, data) {
  const result = await pool.query(
    `UPDATE clientes
     SET nombres=$1, apellidos=$2, telefono=$3, email=NULLIF($4, ''), num_id=NULLIF($5, ''), updated_at=NOW()
     WHERE id=$6
     RETURNING *`,
    [data.nombres, data.apellidos, data.telefono, data.email, data.num_id, id]
  );
  if (!result.rows.length) throw { status: 404, message: 'Cliente no encontrado.' };
  return result.rows[0];
}

module.exports = { listClients, createClient, updateClient };
