const express = require('express');
const router = express.Router();
const offerBannerController = require('../../controllers/api/offerBannerController')


// Get active banners for homepage carousel
router.get('/', offerBannerController.getActiveBanners);

module.exports = router;