require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/authRoutes');
const userRoutes = require('./modules/users/userRoutes');
const clientRoutes = require('./modules/clients/clientRoutes');
const tableRoutes = require('./modules/tables/tableRoutes');
const reservationRoutes = require('./modules/reservations/reservationRoutes');
const reportRoutes = require('./modules/reports/reportRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ status: 'online', ts: new Date() }));
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/clients', authMiddleware, clientRoutes);
app.use('/api/tables', authMiddleware, tableRoutes);
app.use('/api/reservations', authMiddleware, reservationRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`MESA//SYSTEM API online on port ${PORT}`));
