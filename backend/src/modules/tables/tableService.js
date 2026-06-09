const pool = require('../../config/db');

async function listTables() {
  const result = await pool.query(
    `SELECT m.*,
            CASE
              WHEN EXISTS (
                SELECT 1 FROM reservaciones r
                WHERE r.id_mesa = m.id
                  AND r.fecha = CURRENT_DATE
                  AND r.estado NOT IN ('cancelada', 'finalizada', 'no_asistio')
              ) THEN 'reservada'
              ELSE m.estado
            END AS estado_visual
     FROM mesas m
     ORDER BY m.numero`
  );
  return result.rows;
}

function toMinutes(time) {
  const [hours, minutes] = String(time).split(':').map(Number);
  return hours * 60 + minutes;
}

function toTime(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

async function getTableSchedule(id, fecha) {
  const tableResult = await pool.query('SELECT * FROM mesas WHERE id = $1', [id]);
  if (!tableResult.rows.length) throw { status: 404, message: 'Mesa no encontrada.' };

  const day = fecha || new Date().toISOString().slice(0, 10);
  const reservations = await pool.query(
    `SELECT r.id, r.fecha, r.hora_inicio::text, r.hora_fin::text, r.estado,
            r.num_personas, r.observaciones, c.nombres, c.apellidos
     FROM reservaciones r
     JOIN clientes c ON c.id = r.id_cliente
     WHERE r.id_mesa = $1
       AND r.fecha = $2
       AND r.estado NOT IN ('cancelada', 'finalizada', 'no_asistio')
     ORDER BY r.hora_inicio`,
    [id, day]
  );

  const slots = [];
  for (let start = 12 * 60; start < 23 * 60; start += 60) {
    const end = start + 60;
    const reservation = reservations.rows.find((item) => {
      const reservedStart = toMinutes(item.hora_inicio);
      const reservedEnd = toMinutes(item.hora_fin);
      return reservedStart < end && reservedEnd > start;
    });

    slots.push({
      hora_inicio: toTime(start),
      hora_fin: toTime(end),
      estado: reservation ? 'reservada' : 'disponible',
      reserva: reservation || null
    });
  }

  return {
    mesa: tableResult.rows[0],
    fecha: day,
    reservas: reservations.rows,
    slots
  };
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

module.exports = { listTables, getTableSchedule, createTable, updateTable };
