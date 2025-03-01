// src/routes/admin/adminRatingRoutes.js
const express = require('express');
const router = express.Router();
const { adminProtect } = require('../../middlewares/authMiddleware');
const adminRatingController = require('../../controllers/admin/adminRatingController');

// List all ratings
router.get('/', adminProtect, adminRatingController.listRatings);
router.get('/:id', adminProtect, adminRatingController.getRatingDetails);
router.put('/:id', adminProtect, adminRatingController.updateRatingStatus);
router.delete('/:id', adminProtect, adminRatingController.deleteRating);

module.exports = router;