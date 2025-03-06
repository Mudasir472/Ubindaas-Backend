const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/api/orderController');
// const { protect } = require('../../middlewares/authMiddleware');
const authenticate = require('../../middlewares/authenticate')
// console.log("ordercontroller", orderController);
// console.log("protect: ", authenticate);

router.post('/create', authenticate, orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getUserOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/:id/cancel', authenticate, orderController.cancelOrder);
router.get('/:id/track', authenticate, orderController.trackOrder);

module.exports = router;