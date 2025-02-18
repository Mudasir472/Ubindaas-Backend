const Razorpay = require('razorpay');
const Setting = require('../models/Setting');

let razorpay = null;

// Initialize Razorpay with credentials
const initializeRazorpay = async () => {
    try {
        const settings = await Setting.findOne();
        if (!settings?.payment?.razorpayKey || !settings?.payment?.razorpaySecret) {
            throw new Error('Razorpay credentials not found');
        }

        razorpay = new Razorpay({
            key_id: settings.payment.razorpayKey,
            key_secret: settings.payment.razorpaySecret
        });

        return razorpay;
    } catch (error) {
        console.error('Error initializing Razorpay:', error);
        throw error;
    }
};

// Create order
exports.createOrder = async (amount, receipt) => {
    try {
        if (!razorpay) {
            await initializeRazorpay();
        }

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw error;
    }
};

// Verify payment
exports.verifyPayment = async (paymentId, orderId, signature) => {
    try {
        const crypto = require('crypto');
        const settings = await Setting.findOne();
        
        const text = orderId + "|" + paymentId;
        const generated_signature = crypto
            .createHmac('sha256', settings.payment.razorpaySecret)
            .update(text)
            .digest('hex');

        return generated_signature === signature;
    } catch (error) {
        console.error('Error verifying payment:', error);
        throw error;
    }
};