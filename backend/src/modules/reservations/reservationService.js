const pool = require('../../config/db');

const inactiveStates = ['cancelada', 'finalizada', 'no_asistio'];

async function assertAvailable(db, { id_mesa, fecha, hora_inicio, hora_fin }, excludeId = null) {
  const params = [id_mesa, fecha, hora_inicio, hora_fin];
  let exclude = '';
  if (excludeId) {
    params.push(excludeId);
    exclude = `AND id != $${params.length}`;
  }
  params.push(inactiveStates);
  const inactiveIndex = params.length;

  const conflict = await db.query(
    `SELECT id FROM reservaciones
     WHERE id_mesa = $1
       AND fecha = $2
       ${exclude}
       AND estado <> ALL($${inactiveIndex}::text[])
       AND (hora_inicio, hora_fin) OVERLAPS ($3::time, $4::time)`,
    params
  );
  if (conflict.rows.length) {
    throw { status: 409, message: 'La mesa no esta disponible en ese horario.' };
  }
}

async function getAvailability({ fecha, hora_inicio, hora_fin, num_personas }) {
  const result = await pool.query(
    `SELECT m.* FROM mesas m
     WHERE m.activo = true
       AND m.estado = 'disponible'
       AND m.capacidad >= $4
       AND m.id NOT IN (
         SELECT id_mesa FROM reservaciones
         WHERE fecha = $1
           AND estado <> ALL($5::text[])
           AND (hora_inicio, hora_fin) OVERLAPS ($2::time, $3::time)
       )
     ORDER BY m.capacidad, m.numero`,
    [fecha, hora_inicio, hora_fin, num_personas, inactiveStates]
  );
  return result.rows;
}

async function createReservation(data, userId) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    await assertAvailable(db, data);

    const result = await db.query(
      `INSERT INTO reservaciones
       (id_cliente, id_mesa, id_usuario, fecha, hora_inicio, hora_fin, num_personas, estado, observaciones)
       VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8, 'pendiente'),$9)
       RETURNING *`,
      [
        data.id_cliente,
        data.id_mesa,
        userId,
        data.fecha,
        data.hora_inicio,
        data.hora_fin,
        data.num_personas,
        data.estado,
        data.observaciones
      ]
    );

    await db.query(
      `INSERT INTO auditoria (id_usuario, tabla_afectada, operacion, registro_id, descripcion)
       VALUES ($1, 'reservaciones', 'INSERT', $2, $3)`,
      [userId, result.rows[0].id, `Reserva creada para mesa ${data.id_mesa} el ${data.fecha}`]
    );

    await db.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  } finally {
    db.release();
  }
}

async function updateReservation(id, data, userId) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    await assertAvailable(db, data, id);

    const result = await db.query(
      `UPDATE reservaciones
       SET id_cliente=$1, id_mesa=$2, fecha=$3, hora_inicio=$4, hora_fin=$5,
           num_personas=$6, estado=$7, observaciones=$8, updated_at=NOW(), updated_by=$9
       WHERE id=$10
       RETURNING *`,
      [
        data.id_cliente,
        data.id_mesa,
        data.fecha,
        data.hora_inicio,
        data.hora_fin,
        data.num_personas,
        data.estado,
        data.observaciones,
        userId,
        id
      ]
    );
    if (!result.rows.length) throw { status: 404, message: 'Reserva no encontrada.' };

    await db.query(
      `INSERT INTO auditoria (id_usuario, tabla_afectada, operacion, registro_id, descripcion)
       VALUES ($1, 'reservaciones', 'UPDATE', $2, 'Reserva modificada')`,
      [userId, id]
    );

    await db.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  } finally {
    db.release();
  }
}

async function cancelReservation(id, userId) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const result = await db.query(
      `UPDATE reservaciones
       SET estado='cancelada', updated_at=NOW(), updated_by=$2
       WHERE id=$1 AND estado NOT IN ('cancelada', 'finalizada')
       RETURNING *`,
      [id, userId]
    );
    if (!result.rows.length) throw { status: 404, message: 'Reserva no encontrada o ya cerrada.' };

    await db.query(
      `INSERT INTO auditoria (id_usuario, tabla_afectada, operacion, registro_id, descripcion)
       VALUES ($1, 'reservaciones', 'UPDATE', $2, 'Reserva cancelada')`,
      [userId, id]
    );

    await db.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  } finally {
    db.release();
  }
}

async function changeStatus(id, estado, userId) {
  const result = await pool.query(
    `UPDATE reservaciones
     SET estado=$1, updated_at=NOW(), updated_by=$2
     WHERE id=$3
     RETURNING *`,
    [estado, userId, id]
  );
  if (!result.rows.length) throw { status: 404, message: 'Reserva no encontrada.' };
  await pool.query(
    `INSERT INTO auditoria (id_usuario, tabla_afectada, operacion, registro_id, descripcion)
     VALUES ($1, 'reservaciones', 'UPDATE', $2, $3)`,
    [userId, id, `Estado cambiado a ${estado}`]
  );
  return result.rows[0];
}

async function getReservations(filters) {
  let query = `
    SELECT r.*, c.nombres, c.apellidos, c.telefono, c.email,
           m.numero AS numero_mesa, m.ubicacion, u.nombre AS creado_por
    FROM reservaciones r
    JOIN clientes c ON c.id = r.id_cliente
    JOIN mesas m ON m.id = r.id_mesa
    JOIN usuarios u ON u.id = r.id_usuario
    WHERE 1=1`;
  const params = [];

  if (filters.fecha) {
    params.push(filters.fecha);
    query += ` AND r.fecha = $${params.length}`;
  }
  if (filters.id_cliente) {
    params.push(filters.id_cliente);
    query += ` AND r.id_cliente = $${params.length}`;
  }
  if (filters.id_mesa) {
    params.push(filters.id_mesa);
    query += ` AND r.id_mesa = $${params.length}`;
  }
  if (filters.estado) {
    params.push(filters.estado);
    query += ` AND r.estado = $${params.length}`;
  }
  query += ' ORDER BY r.fecha DESC, r.hora_inicio ASC';

  const result = await pool.query(query, params);
  return result.rows;
}

module.exports = {
  getReservations,
  createReservation,
  updateReservation,
  cancelReservation,
  changeStatus,
  getAvailability
};
