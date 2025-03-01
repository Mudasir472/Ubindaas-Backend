const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/api/bannerController');

// Get active banners for homepage carousel
router.get('/', bannerController.getActiveBanners);

module.exports = router;