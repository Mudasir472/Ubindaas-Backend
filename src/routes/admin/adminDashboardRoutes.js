// src/routes/admin/adminDashboardRoutes.js
const express = require('express');
const router = express.Router();
const { adminProtect } = require('../../middlewares/authMiddleware');
const adminDashboardController = require('../../controllers/admin/adminDashboardController');

// Dashboard routes
router.get('/', adminProtect, adminDashboardController.getDashboard);
router.get('/analytics', adminProtect, adminDashboardController.getAnalytics);

module.exports = router;