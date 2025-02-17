// src/routes/admin/adminAuthRoutes.js
const express = require('express');
const router = express.Router();
const adminAuthController = require('../../controllers/admin/adminAuthController');

// Make sure each route has a valid controller function
router.get('/login', adminAuthController.getLogin);
router.post('/login', adminAuthController.login);
router.get('/logout', adminAuthController.logout);

module.exports = router;