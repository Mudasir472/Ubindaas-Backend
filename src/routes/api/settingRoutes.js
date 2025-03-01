const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/api/settingController');

router.get('/', settingsController.getSettings);
router.get('/shipping', settingsController.getShippingMethods);
router.get('/seo', settingsController.getSeoSettings);
router.get('/contact', settingsController.getContactInfo);

module.exports = router;