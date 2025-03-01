const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/api/dashboardController');

console.log('Dashboard Controller:', dashboardController);

// const { protect } = require('../../middlewares/authMiddleware');
const { protect } = require('../../middlewares/authMiddleware');

console.log('Protect Middleware:', protect);


router.get('/stats', protect, dashboardController.getStats);
router.get('/recent-orders', protect, dashboardController.getRecentOrders);
router.get('/top-products', protect, dashboardController.getTopProducts);
router.get('/revenue', protect, dashboardController.getRevenue);

module.exports = router;