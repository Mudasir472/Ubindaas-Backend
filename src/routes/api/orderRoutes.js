const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/api/orderController');
const { protect } = require('../../middlewares/authMiddleware');
console.log("ordercontroller" ,orderController);
console.log("protect: ", protect);

router.post('/create', protect, orderController.createOrder);
// router.get('/my-orders', protect, orderController.getUserOrders);
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id/cancel', protect, orderController.cancelOrder);
router.get('/:id/track', protect, orderController.trackOrder);

module.exports = router;