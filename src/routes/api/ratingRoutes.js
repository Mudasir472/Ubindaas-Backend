const express = require('express');
const router = express.Router();
const ratingController = require('../../controllers/api/ratingController');
const { protect } = require('../../middlewares/authMiddleware');

// Public routes
router.get('/getAllRatings',ratingController.getRatings)
router.get('/product/:productId', ratingController.getProductRatings);
router.get('/average/:productId', ratingController.getAverageRating);

// Protected routes (require authentication)
router.post('/', protect, ratingController.addRating);
router.delete('/:id', protect, ratingController.deleteRating);

// Test route (for debugging)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Rating API is working' });
});

module.exports = router;