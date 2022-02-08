const express = require('express');
const router = express.Router();
const userControl = require('../controllers/user');
const limiter = require('../middlewares/limiter')

router.post('/signup', limiter.auth, userControl.signup);
router.post('/login', limiter.auth, userControl.login);

module.exports = router;