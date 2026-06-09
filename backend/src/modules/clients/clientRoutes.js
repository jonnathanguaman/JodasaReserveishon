const router = require('express').Router();
const controller = require('./clientController');

router.get('/', controller.listClients);
router.post('/', controller.createClient);
router.put('/:id', controller.updateClient);

module.exports = router;
