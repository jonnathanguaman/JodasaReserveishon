const pool = require('../../config/db');

async function dashboard() {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM reservaciones WHERE fecha = CURRENT_DATE) AS reservas_hoy,
      (SELECT COUNT(*) FROM reservaciones WHERE estado = 'confirmada') AS confirmadas,
      (SELECT COUNT(*) FROM clientes) AS clientes,
      (SELECT COUNT(*) FROM mesas WHERE activo = true) AS mesas_activas
  `);
  return result.rows[0];
}

async function reservationsByDay(fecha) {
  const result = await pool.query(
    `SELECT estado, COUNT(*)::int AS total
     FROM reservaciones
     WHERE fecha = COALESCE($1::date, CURRENT_DATE)
     GROUP BY estado
     ORDER BY estado`,
    [fecha || null]
  );
  return result.rows;
}

async function mostReservedTables(limit = 5) {
  const result = await pool.query(
    `SELECT m.numero, m.ubicacion, COUNT(r.id)::int AS total_reservas
     FROM mesas m
     LEFT JOIN reservaciones r ON r.id_mesa = m.id AND r.estado != 'cancelada'
     GROUP BY m.id
     ORDER BY total_reservas DESC, m.numero
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function frequentClients(limit = 10) {
  const result = await pool.query(
    `SELECT c.nombres, c.apellidos, c.email, COUNT(r.id)::int AS total_reservas
     FROM clientes c
     LEFT JOIN reservaciones r ON r.id_cliente = c.id AND r.estado != 'cancelada'
     GROUP BY c.id
     ORDER BY total_reservas DESC, c.apellidos
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function peakHours() {
  const result = await pool.query(
    `SELECT hora_inicio::text, COUNT(*)::int AS total
     FROM reservaciones
     WHERE estado != 'cancelada'
     GROUP BY hora_inicio
     ORDER BY total DESC, hora_inicio`
  );
  return result.rows;
}

async function cancelledReservations({ desde, hasta }) {
  const result = await pool.query(
    `SELECT r.*, c.nombres, c.apellidos, m.numero AS mesa
     FROM reservaciones r
     JOIN clientes c ON c.id = r.id_cliente
     JOIN mesas m ON m.id = r.id_mesa
     WHERE r.estado = 'cancelada'
       AND r.fecha BETWEEN COALESCE($1::date, CURRENT_DATE - INTERVAL '30 days')
                       AND COALESCE($2::date, CURRENT_DATE)
     ORDER BY r.fecha DESC`,
    [desde || null, hasta || null]
  );
  return result.rows;
}

module.exports = {
  dashboard,
  reservationsByDay,
  mostReservedTables,
  frequentClients,
  peakHours,
  cancelledReservations
};
