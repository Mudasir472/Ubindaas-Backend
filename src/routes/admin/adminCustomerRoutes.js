const express = require('express');
const router = express.Router();
const { adminProtect } = require('../../middlewares/authMiddleware');
const adminCustomerController = require('../../controllers/admin/adminCustomerController');

// Customer routes
router.get('/', adminProtect, adminCustomerController.listCustomers);
router.get('/view/:id', adminProtect, adminCustomerController.viewCustomer);
router.put('/:id/status', adminProtect, adminCustomerController.updateStatus);
router.get('/export', adminProtect, adminCustomerController.exportCustomers);

module.exports = router;  // Make sure this is present