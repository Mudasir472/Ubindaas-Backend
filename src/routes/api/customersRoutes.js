const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/api/customerController');
const { protect } = require('../../middlewares/authMiddleware');
const authenticate = require('../../middlewares/authenticate');


// Profile management
router.get('/profile', protect, customerController.getProfile);
router.put('/profile', authenticate, customerController.updateProfile);
router.put('/change-password', authenticate, customerController.changePassword);

// Address management
router.get('/addresses', authenticate, customerController.getAddresses);
router.post('/addresses', authenticate, customerController.addAddress);
router.put('/addresses/:id', protect, customerController.updateAddress);
router.delete('/addresses/:id', authenticate, customerController.deleteAddress);

// Orders
router.get('/orders', protect, customerController.getOrders);
router.get('/orders/:id', protect, customerController.getOrderDetails);

// Wishlist
router.get('/wishlist', authenticate, customerController.getWishlist);
router.post('/wishlist',  customerController.addToWishlist);
// router.delete('/wishlist/:productId', protect, customerController.removeFromWishlist);

// // Review management
// router.post('/reviews', protect, customerController.addReview);
// router.put('/reviews/:id', protect, customerController.updateReview);
// router.delete('/reviews/:id', protect, customerController.deleteReview);

module.exports = router;