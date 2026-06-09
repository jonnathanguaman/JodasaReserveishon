# 🔷 SISTEMA DE RESERVAS DE MESAS — ARQUITECTURA MONOLÍTICA
> **Curso:** Arquitectura de Software  
> **Stack:** Node.js + Express · React + Vite · PostgreSQL  
> **Estilo UI:** Cyberpunk Realism

---

## PASO 1 — OBJETIVOS FUNCIONALES Y NO FUNCIONALES

### ✅ Requerimientos Funcionales

| Código | Requerimiento                  | Descripción |
|--------|-------------------------------|-------------|
| RF01   | Registrar clientes            | Registrar clientes con nombres, apellidos, teléfono, correo e identificación opcional. |
| RF02   | Consultar clientes            | Buscar clientes por nombre, teléfono, correo o número de identificación. |
| RF03   | Actualizar datos del cliente  | Modificar la información de un cliente ya registrado. |
| RF04   | Administrar mesas             | Registrar, actualizar y desactivar mesas: número, capacidad, ubicación y estado. |
| RF05   | Consultar disponibilidad      | Consultar mesas disponibles según fecha, hora y cantidad de personas. |
| RF06   | Realizar una reserva          | Crear reserva seleccionando cliente, mesa, fecha, hora, personas y observaciones. |
| RF07   | Validar disponibilidad        | Verificar que la mesa no tenga reserva en el mismo horario antes de confirmar. |
| RF08   | Cancelar una reserva          | Cancelar una reserva existente y liberar la mesa. |
| RF09   | Modificar una reserva         | Cambiar fecha, hora, mesa, número de personas u observaciones de una reserva. |
| RF10   | Consultar reservas            | Consultar reservas por fecha, cliente, mesa o estado. |
| RF11   | Cambiar estado de reserva     | Manejar estados: pendiente, confirmada, cancelada, finalizada, no asistió. |
| RF12   | Generar reportes básicos      | Reportes por día, mesas más reservadas, clientes frecuentes, canceladas, horarios pico. |
| RF13   | Gestionar usuarios del sistema| Acceso de usuarios administrativos: administrador y recepcionista. |
| RF14   | Iniciar sesión                | Ingreso con usuario y contraseña. |
| RF15   | Cerrar sesión                 | Cierre de sesión de forma segura. |

### 🔒 Requerimientos No Funcionales

| Código | Requerimiento         | Descripción |
|--------|-----------------------|-------------|
| RNF01  | Usabilidad            | Interfaz clara para personal de restaurante; reservas en pocos pasos. |
| RNF02  | Rendimiento           | Respuesta < 3 segundos en consultas de disponibilidad y creación de reservas. |
| RNF03  | Seguridad             | Autenticación con JWT y control de roles (administrador / recepcionista). |
| RNF04  | Integridad de datos   | Sin reservas duplicadas para misma mesa, fecha y hora (validación + constraint DB). |
| RNF05  | Disponibilidad        | Operativo durante el horario de atención del restaurante. |
| RNF06  | Mantenibilidad        | Código organizado por módulos: clientes, mesas, reservas, seguridad, reportes. |
| RNF07  | Escalabilidad básica  | Diseño que permita agregar reservas en línea, pagos o notificaciones en el futuro. |
| RNF08  | Compatibilidad        | Funciona en Chrome, Edge y Firefox modernos. |
| RNF09  | Respaldo de información | Base de datos con soporte para pg_dump / backups periódicos. |
| RNF10  | Confiabilidad         | Información consistente bajo operaciones concurrentes de creación/modificación. |
| RNF11  | Control de errores    | Mensajes claros: "La mesa no está disponible en ese horario". |
| RNF12  | Auditoría básica      | Registro de quién creó, modificó o canceló cada reserva. |

---

## PASO 2 — DISEÑO DE ARQUITECTURA MONOLÍTICA

### Estructura del Sistema

```
+──────────────────────────────────────────────────────────+
│               SISTEMA DE RESERVAS DE MESAS               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │          CAPA DE PRESENTACIÓN  (React)             │  │
│  │  Dashboard · Reservas · Clientes · Mesas ·         │  │
│  │  Reportes · Login                                  │  │
│  └────────────────────────────────────────────────────┘  │
│                           │ HTTP / REST                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │        CAPA DE LÓGICA DE NEGOCIO  (Express)        │  │
│  │  AuthService · ClientService · TableService ·      │  │
│  │  ReservationService · AvailabilityService ·        │  │
│  │  ReportService                                     │  │
│  └────────────────────────────────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │          CAPA DE ACCESO A DATOS  (pg)              │  │
│  │  ClientRepository · TableRepository ·              │  │
│  │  ReservationRepository · UserRepository ·          │  │
│  │  AuditRepository                                   │  │
│  └────────────────────────────────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │          SEGURIDAD / AUTENTICACIÓN                 │  │
│  │  JWT Middleware · Role Guard (admin/receptionist)  │  │
│  │  bcrypt · Audit Logger                             │  │
│  └────────────────────────────────────────────────────┘  │
+──────────────────────────────────────────────────────────+
                           │
                           ▼
                 ┌──────────────────┐
                 │   PostgreSQL DB  │
                 │  reservas_db     │
                 └──────────────────┘
```

### Estructura de Carpetas

```
reservas-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── authController.js
│   │   │   │   ├── authService.js
│   │   │   │   └── authRoutes.js
│   │   │   ├── clients/
│   │   │   │   ├── clientController.js
│   │   │   │   ├── clientService.js
│   │   │   │   └── clientRoutes.js
│   │   │   ├── tables/
│   │   │   │   ├── tableController.js
│   │   │   │   ├── tableService.js
│   │   │   │   └── tableRoutes.js
│   │   │   ├── reservations/
│   │   │   │   ├── reservationController.js
│   │   │   │   ├── reservationService.js
│   │   │   │   └── reservationRoutes.js
│   │   │   └── reports/
│   │   │       ├── reportController.js
│   │   │       ├── reportService.js
│   │   │       └── reportRoutes.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── auditMiddleware.js
│   │   │   └── errorHandler.js
│   │   └── app.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── NavBar.jsx
    │   │   ├── StatusBadge.jsx
    │   │   ├── NeonTable.jsx
    │   │   └── Toast.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ReservationsPage.jsx
    │   │   ├── AvailabilityPage.jsx
    │   │   ├── ClientsPage.jsx
    │   │   ├── TablesPage.jsx
    │   │   └── ReportsPage.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## PASO 3 — DISEÑO DE BASE DE DATOS

### Diagrama Entidad-Relación

```
┌──────────────┐       ┌─────────────────────┐       ┌──────────────┐
│   usuarios   │       │    reservaciones     │       │    mesas     │
├──────────────┤       ├─────────────────────┤       ├──────────────┤
│ PK id        │       │ PK id               │       │ PK id        │
│    username  │       │ FK id_cliente ───┐  │       │    numero    │
│    password  │       │ FK id_mesa    ───┼──┼───────│    capacidad │
│    rol       │       │ FK id_usuario ───┼──┼──┐    │    ubicacion │
│    nombre    │       │    fecha          │  │  │    │    estado    │
│    activo    │       │    hora_inicio    │  │  │    │    activo    │
└──────────────┘       │    hora_fin       │  │  │    └──────────────┘
       │               │    num_personas   │  │  │
       │◄──────────────│    estado         │  │  │
       │               │    observaciones  │  │  │
       │               │    created_at     │  │  │
       │               └─────────────────────┘  │
       │                         │               │
       │               ┌─────────┘               │
       │               ▼                         │
       │    ┌──────────────────┐                 │
       │    │     clientes     │                 │
       │    ├──────────────────┤                 │
       │    │ PK id            │                 │
       │    │    nombres       │                 │
       │    │    apellidos     │                 │
       │    │    telefono      │                 │
       │    │    email         │                 │
       │    │    num_id        │ (opcional)      │
       │    │    created_at    │                 │
       │    └──────────────────┘                 │
       │                                         │
       ▼                                         │
┌─────────────────────────────────────────────┐  │
│                auditoria                    │  │
├─────────────────────────────────────────────┤  │
│ PK id                                       │  │
│ FK id_usuario ──────────────────────────────┘  │
│    tabla_afectada  (reservaciones/clientes/...) │
│    operacion       (INSERT/UPDATE/DELETE)       │
│    descripcion                                  │
│    fecha_hora                                   │
└─────────────────────────────────────────────────┘
```

### Scripts SQL Completos

```sql
-- ============================================================
-- SCHEMA: reservas_db
-- ============================================================

-- Tabla: usuarios (RF13, RF14, RF15, RNF03)
CREATE TABLE usuarios (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,            -- bcrypt hash
    rol         VARCHAR(20) NOT NULL DEFAULT 'recepcionista'
                CHECK (rol IN ('administrador', 'recepcionista')),
    nombre      VARCHAR(100) NOT NULL,
    activo      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Tabla: clientes (RF01, RF02, RF03)
CREATE TABLE clientes (
    id          SERIAL PRIMARY KEY,
    nombres     VARCHAR(100) NOT NULL,
    apellidos   VARCHAR(100) NOT NULL,
    telefono    VARCHAR(20),
    email       VARCHAR(100) UNIQUE,
    num_id      VARCHAR(30),                       -- cédula/pasaporte, opcional
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Tabla: mesas (RF04)
CREATE TABLE mesas (
    id          SERIAL PRIMARY KEY,
    numero      INTEGER NOT NULL UNIQUE,
    capacidad   INTEGER NOT NULL,
    ubicacion   VARCHAR(50) DEFAULT 'interior'
                CHECK (ubicacion IN ('interior', 'terraza', 'ventana', 'salon_privado', 'barra')),
    estado      VARCHAR(20) DEFAULT 'disponible'
                CHECK (estado IN ('disponible', 'ocupada', 'mantenimiento', 'inactiva')),
    activo      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Tabla: reservaciones (RF06, RF07, RF08, RF09, RF10, RF11)
CREATE TABLE reservaciones (
    id              SERIAL PRIMARY KEY,
    id_cliente      INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    id_mesa         INTEGER NOT NULL REFERENCES mesas(id) ON DELETE RESTRICT,
    id_usuario      INTEGER NOT NULL REFERENCES usuarios(id),  -- quién creó (RNF12)
    fecha           DATE NOT NULL,
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME NOT NULL,
    num_personas    INTEGER NOT NULL,
    estado          VARCHAR(20) DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'finalizada', 'no_asistio')),
    observaciones   TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    updated_by      INTEGER REFERENCES usuarios(id)           -- última modificación (RNF12)
);

-- Tabla: auditoria (RNF12)
CREATE TABLE auditoria (
    id              SERIAL PRIMARY KEY,
    id_usuario      INTEGER REFERENCES usuarios(id),
    tabla_afectada  VARCHAR(50) NOT NULL,
    operacion       VARCHAR(20) NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    registro_id     INTEGER,
    descripcion     TEXT,
    fecha_hora      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES (RNF02 — rendimiento < 3s)
-- ============================================================
CREATE INDEX idx_res_fecha         ON reservaciones(fecha);
CREATE INDEX idx_res_mesa          ON reservaciones(id_mesa);
CREATE INDEX idx_res_cliente       ON reservaciones(id_cliente);
CREATE INDEX idx_res_estado        ON reservaciones(estado);
CREATE INDEX idx_res_mesa_fecha    ON reservaciones(id_mesa, fecha);
CREATE INDEX idx_clientes_email    ON clientes(email);
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_num_id   ON clientes(num_id);

-- ============================================================
-- CONSTRAINT: evitar reservas duplicadas (RNF04)
-- Se gestiona en la capa de servicio con OVERLAPS + unique check
-- ============================================================

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Usuario administrador por defecto (password: admin123 en bcrypt)
INSERT INTO usuarios (username, password, rol, nombre) VALUES
('admin', '$2b$10$placeholder_hash_here', 'administrador', 'Administrador Sistema');

-- Mesas de ejemplo
INSERT INTO mesas (numero, capacidad, ubicacion) VALUES
(1, 2, 'ventana'),
(2, 2, 'ventana'),
(3, 4, 'interior'),
(4, 4, 'interior'),
(5, 4, 'terraza'),
(6, 6, 'terraza'),
(7, 8, 'salon_privado'),
(8, 10, 'salon_privado');
```

---

## PASO 4 — VENTAJAS Y DESVENTAJAS

### ✅ Ventajas

| # | Ventaja | Aplicación al Sistema |
|---|---------|----------------------|
| 1 | **Despliegue simple** | `node app.js` levanta toda la aplicación; ideal para un restaurante pequeño. |
| 2 | **Sin latencia entre servicios** | ReservationService llama a AvailabilityService en memoria, sin red. |
| 3 | **Transacciones ACID directas** | Una reserva y su entrada de auditoría se guardan en la misma transacción pg. |
| 4 | **Menor costo operacional** | Sin Kubernetes, sin API Gateway, sin service mesh. |
| 5 | **Debugging centralizado** | Un solo log para toda la aplicación: auth, reservas, reportes. |
| 6 | **Curva de aprendizaje baja** | El equipo de desarrollo puede entender todo el sistema en un solo repositorio. |

### ❌ Desventajas

| # | Desventaja | Impacto |
|---|------------|---------|
| 1 | **Escalabilidad horizontal limitada** | Si el módulo de reportes consume mucha CPU, afecta las reservas en tiempo real. |
| 2 | **Despliegue acoplado** | Cambiar solo el módulo de clientes requiere redesplegar todo. |
| 3 | **SPOF (Single Point of Failure)** | Si el proceso Express cae, se pierde toda la funcionalidad. |
| 4 | **Crecimiento del código** | Con RF12 (reportes complejos) y futuras funciones, el monolito se vuelve difícil de mantener sin disciplina modular. |
| 5 | **Tecnología única** | No se puede usar Python para análisis de datos sin integrarlo al mismo proceso Node. |

---

## IMPLEMENTACIÓN — CÓDIGO BASE

### `backend/src/app.js`

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes        = require('./modules/auth/authRoutes');
const clientRoutes      = require('./modules/clients/clientRoutes');
const tableRoutes       = require('./modules/tables/tableRoutes');
const reservationRoutes = require('./modules/reservations/reservationRoutes');
const reportRoutes      = require('./modules/reports/reportRoutes');
const errorHandler      = require('./middlewares/errorHandler');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth',         authRoutes);
app.use('/api/clients',      clientRoutes);
app.use('/api/tables',       tableRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reports',      reportRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'online', ts: new Date() }));
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`◈ Server on port ${PORT}`));
```

### `backend/src/modules/reservations/reservationService.js`

```javascript
const pool = require('../../config/db');

// RF06 + RF07 — Crear reserva con validación de disponibilidad
async function createReservation(data, userId) {
  const { id_cliente, id_mesa, fecha, hora_inicio, hora_fin, num_personas, observaciones } = data;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // RF07: verificar conflicto de horario (RNF04)
    const conflict = await client.query(
      `SELECT id FROM reservaciones
       WHERE id_mesa = $1 AND fecha = $2
         AND estado NOT IN ('cancelada', 'finalizada', 'no_asistio')
         AND (hora_inicio, hora_fin) OVERLAPS ($3::time, $4::time)`,
      [id_mesa, fecha, hora_inicio, hora_fin]
    );
    if (conflict.rows.length > 0) {
      throw { status: 409, message: 'La mesa no está disponible en ese horario.' };
    }

    // Insertar reserva
    const res = await client.query(
      `INSERT INTO reservaciones
         (id_cliente, id_mesa, id_usuario, fecha, hora_inicio, hora_fin, num_personas, observaciones)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id_cliente, id_mesa, userId, fecha, hora_inicio, hora_fin, num_personas, observaciones]
    );

    // RNF12: auditoría
    await client.query(
      `INSERT INTO auditoria (id_usuario, tabla_afectada, operacion, registro_id, descripcion)
       VALUES ($1, 'reservaciones', 'INSERT', $2, $3)`,
      [userId, res.rows[0].id, `Reserva creada para mesa ${id_mesa} el ${fecha}`]
    );

    await client.query('COMMIT');
    return res.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// RF05: Consultar disponibilidad
async function getAvailability({ fecha, hora_inicio, hora_fin, num_personas }) {
  const result = await pool.query(
    `SELECT m.* FROM mesas m
     WHERE m.activo = true AND m.estado = 'disponible' AND m.capacidad >= $4
       AND m.id NOT IN (
         SELECT id_mesa FROM reservaciones
         WHERE fecha = $1
           AND estado NOT IN ('cancelada', 'finalizada', 'no_asistio')
           AND (hora_inicio, hora_fin) OVERLAPS ($2::time, $3::time)
       )
     ORDER BY m.capacidad`,
    [fecha, hora_inicio, hora_fin, num_personas]
  );
  return result.rows;
}

// RF08: Cancelar reserva
async function cancelReservation(id, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await client.query(
      `UPDATE reservaciones
       SET estado = 'cancelada', updated_at = NOW(), updated_by = $2
       WHERE id = $1 AND estado NOT IN ('cancelada','finalizada')
       RETURNING *`,
      [id, userId]
    );
    if (!res.rows.length) throw { status: 404, message: 'Reserva no encontrada o ya cancelada.' };

    await client.query(
      `INSERT INTO auditoria (id_usuario, tabla_afectada, operacion, registro_id, descripcion)
       VALUES ($1, 'reservaciones', 'UPDATE', $2, 'Reserva cancelada')`,
      [userId, id]
    );
    await client.query('COMMIT');
    return res.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// RF09: Modificar reserva
async function updateReservation(id, data, userId) {
  const { fecha, hora_inicio, hora_fin, id_mesa, num_personas, observaciones } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar conflicto excluyendo la reserva actual
    const conflict = await client.query(
      `SELECT id FROM reservaciones
       WHERE id_mesa = $1 AND fecha = $2 AND id != $5
         AND estado NOT IN ('cancelada','finalizada','no_asistio')
         AND (hora_inicio, hora_fin) OVERLAPS ($3::time, $4::time)`,
      [id_mesa, fecha, hora_inicio, hora_fin, id]
    );
    if (conflict.rows.length > 0) {
      throw { status: 409, message: 'La mesa no está disponible en ese horario.' };
    }

    const res = await client.query(
      `UPDATE reservaciones
       SET fecha=$1, hora_inicio=$2, hora_fin=$3, id_mesa=$4,
           num_personas=$5, observaciones=$6, updated_at=NOW(), updated_by=$7
       WHERE id=$8 RETURNING *`,
      [fecha, hora_inicio, hora_fin, id_mesa, num_personas, observaciones, userId, id]
    );

    await client.query(
      `INSERT INTO auditoria (id_usuario, tabla_afectada, operacion, registro_id, descripcion)
       VALUES ($1, 'reservaciones', 'UPDATE', $2, 'Reserva modificada')`,
      [userId, id]
    );
    await client.query('COMMIT');
    return res.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// RF10: Consultar reservas con filtros
async function getReservations({ fecha, id_cliente, id_mesa, estado }) {
  let query = `
    SELECT r.*, c.nombres, c.apellidos, c.telefono,
           m.numero AS numero_mesa, u.nombre AS creado_por
    FROM reservaciones r
    JOIN clientes c ON c.id = r.id_cliente
    JOIN mesas m ON m.id = r.id_mesa
    JOIN usuarios u ON u.id = r.id_usuario
    WHERE 1=1`;
  const params = [];
  if (fecha)      { params.push(fecha);      query += ` AND r.fecha = $${params.length}`; }
  if (id_cliente) { params.push(id_cliente); query += ` AND r.id_cliente = $${params.length}`; }
  if (id_mesa)    { params.push(id_mesa);    query += ` AND r.id_mesa = $${params.length}`; }
  if (estado)     { params.push(estado);     query += ` AND r.estado = $${params.length}`; }
  query += ' ORDER BY r.fecha DESC, r.hora_inicio';
  const result = await pool.query(query, params);
  return result.rows;
}

module.exports = { createReservation, getAvailability, cancelReservation, updateReservation, getReservations };
```

### `backend/src/modules/reports/reportService.js`

```javascript
const pool = require('../../config/db');

// RF12 — Reportes básicos

async function reservationsByDay(fecha) {
  const res = await pool.query(
    `SELECT r.estado, COUNT(*) as total
     FROM reservaciones r WHERE r.fecha = $1 GROUP BY r.estado`,
    [fecha]
  );
  return res.rows;
}

async function mostReservedTables(limit = 5) {
  const res = await pool.query(
    `SELECT m.numero, m.ubicacion, COUNT(r.id) as total_reservas
     FROM reservaciones r JOIN mesas m ON m.id = r.id_mesa
     WHERE r.estado != 'cancelada'
     GROUP BY m.id ORDER BY total_reservas DESC LIMIT $1`,
    [limit]
  );
  return res.rows;
}

async function frequentClients(limit = 10) {
  const res = await pool.query(
    `SELECT c.nombres, c.apellidos, c.email, COUNT(r.id) as total_reservas
     FROM reservaciones r JOIN clientes c ON c.id = r.id_cliente
     WHERE r.estado != 'cancelada'
     GROUP BY c.id ORDER BY total_reservas DESC LIMIT $1`,
    [limit]
  );
  return res.rows;
}

async function peakHours() {
  const res = await pool.query(
    `SELECT hora_inicio, COUNT(*) as total
     FROM reservaciones WHERE estado != 'cancelada'
     GROUP BY hora_inicio ORDER BY total DESC`
  );
  return res.rows;
}

async function cancelledReservations({ desde, hasta }) {
  const res = await pool.query(
    `SELECT r.*, c.nombres, c.apellidos, m.numero AS mesa
     FROM reservaciones r
     JOIN clientes c ON c.id = r.id_cliente
     JOIN mesas m ON m.id = r.id_mesa
     WHERE r.estado = 'cancelada' AND r.fecha BETWEEN $1 AND $2`,
    [desde, hasta]
  );
  return res.rows;
}

module.exports = { reservationsByDay, mostReservedTables, frequentClients, peakHours, cancelledReservations };
```

### `backend/src/middlewares/errorHandler.js`

```javascript
// RNF11 — Mensajes de error claros
module.exports = (err, req, res, next) => {
  const status  = err.status || 500;
  const message = err.message || 'Error interno del servidor.';
  console.error(`[ERROR] ${status} — ${message}`);
  res.status(status).json({ success: false, message });
};
```

### `backend/src/middlewares/authMiddleware.js`

```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token requerido.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};
```

### `backend/src/middlewares/roleMiddleware.js`

```javascript
// RNF03 — Control de roles
module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ message: 'Acceso denegado.' });
  }
  next();
};
```

---

## API ENDPOINTS COMPLETOS

| Método | Ruta                               | Auth | Rol           | RF    |
|--------|------------------------------------|------|---------------|-------|
| POST   | `/api/auth/login`                  | No   | -             | RF14  |
| POST   | `/api/auth/logout`                 | JWT  | todos         | RF15  |
| GET    | `/api/clients`                     | JWT  | todos         | RF02  |
| POST   | `/api/clients`                     | JWT  | todos         | RF01  |
| PUT    | `/api/clients/:id`                 | JWT  | todos         | RF03  |
| GET    | `/api/tables`                      | JWT  | todos         | RF04  |
| POST   | `/api/tables`                      | JWT  | admin         | RF04  |
| PUT    | `/api/tables/:id`                  | JWT  | admin         | RF04  |
| GET    | `/api/reservations`                | JWT  | todos         | RF10  |
| POST   | `/api/reservations`                | JWT  | todos         | RF06  |
| PUT    | `/api/reservations/:id`            | JWT  | todos         | RF09  |
| PATCH  | `/api/reservations/:id/cancel`     | JWT  | todos         | RF08  |
| PATCH  | `/api/reservations/:id/status`     | JWT  | todos         | RF11  |
| GET    | `/api/reservations/availability`   | JWT  | todos         | RF05  |
| GET    | `/api/reports/by-day`              | JWT  | admin         | RF12  |
| GET    | `/api/reports/top-tables`          | JWT  | admin         | RF12  |
| GET    | `/api/reports/frequent-clients`    | JWT  | admin         | RF12  |
| GET    | `/api/reports/peak-hours`          | JWT  | admin         | RF12  |
| GET    | `/api/reports/cancelled`           | JWT  | admin         | RF12  |
| GET    | `/api/users`                       | JWT  | admin         | RF13  |
| POST   | `/api/users`                       | JWT  | admin         | RF13  |

---

## COMANDOS DE INICIO RÁPIDO

```bash
# Base de datos
psql -U postgres -c "CREATE DATABASE reservas_db;"
psql -U postgres -d reservas_db -f schema.sql

# Backend
cd backend
npm install
cp .env.example .env   # configurar DATABASE_URL y JWT_SECRET
npm run dev            # nodemon → puerto 3001

# Frontend
cd frontend
npm install
npm run dev            # Vite → http://localhost:5173
```

### `.env` (backend)

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/reservas_db
JWT_SECRET=tu_clave_secreta_muy_larga
PORT=3001
FRONTEND_URL=http://localhost:5173
```

---

## DEPENDENCIAS

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "pg": "^8.11.0",
    "dotenv": "^16.0.3",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "axios": "^1.4.0",
    "framer-motion": "^10.12.0",
    "recharts": "^2.7.0"
  }
}
```
