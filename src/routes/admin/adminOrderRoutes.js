const express = require('express');
const router = express.Router();
const { adminProtect } = require('../../middlewares/authMiddleware');
const adminOrderController = require('../../controllers/admin/adminOrderController');

// Order routes
router.get('/', adminProtect, adminOrderController.listOrders);
router.get('/view/:id', adminProtect, adminOrderController.viewOrder);
router.put('/:id/status', adminProtect, adminOrderController.updateOrderStatus);
router.put('/:id/tracking', adminProtect, adminOrderController.updateTracking);
// In adminOrderRoutes.js
router.get('/create-test', adminProtect, adminOrderController.createTestOrder);

module.exports = router;