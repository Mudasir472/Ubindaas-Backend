const express = require('express');
const router = express.Router();
const authController = require('../../controllers/api/authController.js');

console.log(authController); // Debugging line to check what is being imported

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

module.exports = router;
