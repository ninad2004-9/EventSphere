const express = require('express');
const router  = express.Router();
const { register, login, getMe, updateMe, checkEmail } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register',     register);
router.post('/login',        login);
router.get('/check-email',   checkEmail);
router.get('/me',            protect, getMe);
router.put('/me',            protect, updateMe);

module.exports = router;
