const router = require('express').Router();
const role = require('../../middlewares/roleMiddleware');
const controller = require('./reportController');

router.get('/dashboard', controller.dashboard);
router.get('/by-day', role('administrador'), controller.byDay);
router.get('/top-tables', role('administrador'), controller.topTables);
router.get('/frequent-clients', role('administrador'), controller.frequentClients);
router.get('/peak-hours', role('administrador'), controller.peakHours);
router.get('/cancelled', role('administrador'), controller.cancelled);

module.exports = router;
