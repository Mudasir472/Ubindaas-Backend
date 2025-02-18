const express = require('express');
const router = express.Router();
const { adminProtect } = require('../../middlewares/authMiddleware');
const adminSettingController = require('../../controllers/admin/adminSettingController');
const upload = require('../../middlewares/uploadMiddleware');

router.get('/', adminProtect, adminSettingController.getSettings);
router.post('/update', adminProtect, upload.single('logo'), adminSettingController.updateSettings);
router.post('/payment', adminProtect, adminSettingController.updatePaymentSettings);

module.exports = router;