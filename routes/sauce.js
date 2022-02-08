const express = require('express');
const router = express.Router();
const sauceControl = require('../controllers/Sauce')
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config')
const limiter = require('../middlewares/limiter');

router.post('/', limiter.mod, auth, multer, sauceControl.createSauce);
router.put('/:id', limiter.mod, auth, multer, sauceControl.modifySauce);
router.delete('/:id', limiter.mod, auth, sauceControl.deleteSauce);
router.get('/:id', limiter.gen, auth, sauceControl.getOneSauce);
router.get('/', limiter.gen, auth, sauceControl.getAllSauces);
router.post('/:id/like', limiter.mod, sauceControl.likeSauce);

module.exports = router;