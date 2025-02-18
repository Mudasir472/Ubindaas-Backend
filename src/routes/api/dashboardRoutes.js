const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/api/dashboardController');
const { protect } = require('../../middlewares/authMiddleware');

router.get('/stats', protect, dashboardController.getStats);
router.get('/recent-orders', protect, dashboardController.getRecentOrders);
router.get('/top-products', protect, dashboardController.getTopProducts);
router.get('/revenue', protect, dashboardController.getRevenue);

module.exports = router;