const router = require('express').Router();
const controller = require('./reservationController');

router.get('/availability', controller.availability);
router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id/cancel', controller.cancel);
router.patch('/:id/status', controller.status);

module.exports = router;
