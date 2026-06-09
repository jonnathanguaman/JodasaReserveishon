const router = require('express').Router();
const role = require('../../middlewares/roleMiddleware');
const controller = require('./tableController');

router.get('/', controller.listTables);
router.get('/:id/schedule', controller.getSchedule);
router.post('/', role('administrador'), controller.createTable);
router.put('/:id', role('administrador'), controller.updateTable);

module.exports = router;
