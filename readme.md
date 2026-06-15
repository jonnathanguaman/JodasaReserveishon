# MESA//SYSTEM Neural Reservation Network

Aplicacion monolitica para gestion de reservas de mesas con Node.js + Express, React + Vite y PostgreSQL.

## Estructura

- `backend/`: API REST, JWT, roles, modulos de clientes, mesas, reservas, usuarios y reportes.
- `backend/public/`: UI ya compilada y servida directamente por Express.
- `backend/db/schema.sql`: esquema PostgreSQL e insercion de mesas demo.
- `backend/scripts/seed.js`: usuario admin y clientes demo.
- `stitch/`: HTML y screenshots descargados desde Stitch como referencia.

## Inicio rapido monolitico

```bash
psql -U odoo1 -c "CREATE DATABASE reservas_db;"
psql -U odoo1 -d reservas_db -f backend/db/schema.sql

cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

Abre la aplicacion en `http://localhost:3001/`. La API queda en `http://localhost:3001/api`.

La carpeta `frontend/` no es necesaria en ejecucion. Express sirve la interfaz desde `backend/public/`, por lo que el proyecto funciona como monolito desde el puerto `3001`.

Credenciales demo:

- Usuario: `admin`
- Password: `admin123`

## Variables

Configura `backend/.env`:

```env
DATABASE_URL=postgresql://odoo1:1234@localhost:5432/reservas_db
JWT_SECRET=mesa_system_dev_secret_change_me
PORT=3001
FRONTEND_URL=http://localhost:5173
```
