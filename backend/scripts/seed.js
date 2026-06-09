require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function seed() {
  const password = await bcrypt.hash('admin123', 10);
  await pool.query(
    `INSERT INTO usuarios (username, password, rol, nombre, activo)
     VALUES ('admin', $1, 'administrador', 'Administrador Sistema', true)
     ON CONFLICT (username)
     DO UPDATE SET password = EXCLUDED.password, rol = EXCLUDED.rol, nombre = EXCLUDED.nombre, activo = true`,
    [password]
  );

  await pool.query(
    `INSERT INTO clientes (nombres, apellidos, telefono, email, num_id)
     VALUES
       ('Valeria', 'Mora', '0991002003', 'valeria@mailsys.test', 'CLI-001'),
       ('Mateo', 'Rios', '0984443311', 'mateo@mailsys.test', 'CLI-002')
     ON CONFLICT (email) DO NOTHING`
  );

  console.log('Seed complete: admin/admin123, demo clients, demo tables from schema.');
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
