const express = require('express');
const router = express.Router();
const adminAuthController = require('../../controllers/admin/adminAuthController');
const { adminProtect } = require('../../middlewares/authMiddleware');

// Auth routes
router.get('/', (req, res) => res.redirect('/admin/login'));
router.get('/login', adminAuthController.getLogin);
router.post('/login', adminAuthController.login);
router.get('/logout', adminAuthController.logout);
router.get('/dashboard', adminProtect, adminAuthController.getDashboard); // Add this line

module.exports = router;