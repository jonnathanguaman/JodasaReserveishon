const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');

async function login({ username, password }) {
  const result = await pool.query(
    'SELECT id, username, password, rol, nombre FROM usuarios WHERE username = $1 AND activo = true',
    [username]
  );
  const user = result.rows[0];
  if (!user) throw { status: 401, message: 'Credenciales invalidas.' };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw { status: 401, message: 'Credenciales invalidas.' };

  const payload = { id: user.id, username: user.username, rol: user.rol, nombre: user.nombre };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
  return { token, user: payload };
}

module.exports = { login };
