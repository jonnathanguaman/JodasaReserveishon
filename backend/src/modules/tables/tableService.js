const pool = require('../../config/db');

async function listTables() {
  const result = await pool.query('SELECT * FROM mesas ORDER BY numero');
  return result.rows;
}

async function createTable(data) {
  const result = await pool.query(
    `INSERT INTO mesas (numero, capacidad, ubicacion, estado, activo)
     VALUES ($1, $2, $3, COALESCE($4, 'disponible'), COALESCE($5, true))
     RETURNING *`,
    [data.numero, data.capacidad, data.ubicacion || 'interior', data.estado, data.activo]
  );
  return result.rows[0];
}

async function updateTable(id, data) {
  const result = await pool.query(
    `UPDATE mesas
     SET numero=$1, capacidad=$2, ubicacion=$3, estado=$4, activo=$5, updated_at=NOW()
     WHERE id=$6
     RETURNING *`,
    [data.numero, data.capacidad, data.ubicacion, data.estado, data.activo, id]
  );
  if (!result.rows.length) throw { status: 404, message: 'Mesa no encontrada.' };
  return result.rows[0];
}

module.exports = { listTables, createTable, updateTable };
