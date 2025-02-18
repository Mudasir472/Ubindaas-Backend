const express = require('express');
const router = express.Router();
const paymentService = require('../../services/paymentService');
const Order = require('../../models/Order');
const { protect } = require('../../middlewares/authMiddleware');

// Get available payment methods
router.get('/methods', async (req, res) => {
    try {
        const methods = await paymentService.getPaymentMethods();
        res.json({
            success: true,
            data: methods
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payment methods'
        });
    }
});

// Initialize payment
router.post('/create-order', protect, async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        
        const razorpayOrder = await paymentService.createOrder(amount, orderId);
        
        res.json({
            success: true,
            order: razorpayOrder
        });
    } catch (error) {
        console.error('Payment initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Error initializing payment'
        });
    }
});

// Verify payment
router.post('/verify', protect, async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        const isValid = await paymentService.verifyPayment(
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        );

        if (!isValid) {
            throw new Error('Payment verification failed');
        }

        // Update order status
        await Order.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            { 
                paymentStatus: 'paid',
                paymentId: razorpay_payment_id,
                status: 'processing'
            }
        );

        res.json({
            success: true,
            message: 'Payment verified successfully'
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed'
        });
    }
});

// Verify COD
router.post('/cod-verify', protect, async (req, res) => {
    try {
        const { orderId } = req.body;

        await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'pending',
            paymentMethod: 'cod',
            status: 'processing'
        });

        res.json({
            success: true,
            message: 'COD order confirmed'
        });
    } catch (error) {
        console.error('COD verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error confirming COD order'
        });
    }
});

module.exports = router;