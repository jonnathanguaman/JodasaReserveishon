const router = require('express').Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const controller = require('./authController');

router.post('/login', controller.login);
router.post('/logout', authMiddleware, controller.logout);
router.get('/me', authMiddleware, controller.me);

module.exports = router;
