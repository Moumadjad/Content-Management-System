const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { validate, registerRules, loginRules, refreshRules } = require('../middleware/validation');

const router = express.Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/refresh', refreshRules, validate, authController.refresh);
router.get('/me', verifyToken, authController.me);

module.exports = router;
