const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay')
const crypto = require('crypto')
require('dotenv').config();
const paymentService = require('../../services/paymentService');
const Order = require('../../models/Order');
const { protect } = require('../../middlewares/authMiddleware');
const authenticate = require('../../middlewares/authenticate');
const { createOrder } = require('../../controllers/api/orderController');
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

// // Initialize payment
// router.post('/create-order', authenticate, async (req, res) => {
//     try {
//         const { amount, orderId } = req.body;

//         const razorpayOrder = await paymentService.createOrder(amount, orderId);

//         res.json({
//             success: true,
//             order: razorpayOrder
//         });
//     } catch (error) {
//         console.error('Payment initialization error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error initializing payment'
//         });
//     }
// });
// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create an order
router.post("/create-order", authenticate, async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.log("error",error);
        
        res.status(500).json({ error: error.message });
    }
});

// Verify payment
// router.post('/verify', authenticate, async (req, res) => {
//     try {
//         const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

//         const isValid = await paymentService.verifyPayment(
//             razorpay_payment_id,
//             razorpay_order_id,
//             razorpay_signature
//         );

//         if (!isValid) {
//             throw new Error('Payment verification failed');
//         }

//         // Update order status
//         await Order.findOneAndUpdate(
//             { razorpayOrderId: razorpay_order_id },
//             {
//                 paymentStatus: 'paid',
//                 paymentId: razorpay_payment_id,
//                 status: 'processing'
//             }
//         );

//         res.json({
//             success: true,
//             message: 'Payment verified successfully'
//         });
//     } catch (error) {
//         console.error('Payment verification error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Payment verification failed'
//         });
//     }
// });

// Verify Payment Signature
router.post("/verify-payment", authenticate, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest("hex");

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        // Call the createOrder function to store order details
        req.body = orderDetails;
        await createOrder(req, res);

    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ success: false, message: "Payment verification error" });
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