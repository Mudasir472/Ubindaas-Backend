const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        default: uuidv4
    },


    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            // required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        size: String,
        color: String
    }],
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
            type: String,
            default: 'India'
        }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online','Razorpay'],
        required: true
    },
    trackingInfo: {
        courier: String,
        trackingId: String,
        url: String
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: String
}, {
    timestamps: true
});

// Generate order ID before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderId) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderId = 'OD' + Date.now().toString().slice(-8) + (count + 1).toString().padStart(4, '0');
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);