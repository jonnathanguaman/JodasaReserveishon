const router = require('express').Router();
const role = require('../../middlewares/roleMiddleware');
const controller = require('./userController');

router.get('/', role('administrador'), controller.listUsers);
router.post('/', role('administrador'), controller.createUser);

module.exports = router;
