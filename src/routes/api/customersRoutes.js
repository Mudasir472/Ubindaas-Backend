const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/api/customerController');
const { protect } = require('../../middlewares/authMiddleware');

// Profile management
router.get('/profile', protect, customerController.getProfile);
router.put('/profile', protect, customerController.updateProfile);
router.put('/change-password', protect, customerController.changePassword);

// Address management
router.get('/addresses', protect, customerController.getAddresses);
router.post('/addresses', protect, customerController.addAddress);
router.put('/addresses/:id', protect, customerController.updateAddress);
router.delete('/addresses/:id', protect, customerController.deleteAddress);

// Orders
router.get('/orders', protect, customerController.getOrders);
router.get('/orders/:id', protect, customerController.getOrderDetails);

// Wishlist
router.get('/wishlist', protect, customerController.getWishlist);
router.post('/wishlist', protect, customerController.addToWishlist);
router.delete('/wishlist/:productId', protect, customerController.removeFromWishlist);

// Review management
router.post('/reviews', protect, customerController.addReview);
router.put('/reviews/:id', protect, customerController.updateReview);
router.delete('/reviews/:id', protect, customerController.deleteReview);

module.exports = router;