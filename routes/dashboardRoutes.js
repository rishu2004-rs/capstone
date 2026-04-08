const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, courtStaff } = require('../middleware/authMiddleware');

router.get('/', protect, courtStaff, getDashboardStats);

module.exports = router;
