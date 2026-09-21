const express = require('express');
const router  = express.Router();
const { getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;
