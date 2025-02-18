const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    storeName: {
        type: String,
        required: true,
        default: 'Ubindass'
    },
    logo: {
        type: String
    },
    contact: {
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: {
                type: String,
                default: 'India'
            }
        }
    },
    socialLinks: {
        facebook: String,
        instagram: String,
        twitter: String
    },
    payment: {
        methods: [{
            name: {
                type: String,
                enum: ['cod', 'online'],
                required: true
            },
            active: {
                type: Boolean,
                default: true
            }
        }],
        razorpayKey: String,
        razorpaySecret: String
    },
    shipping: {
        methods: [{
            name: String,
            price: Number,
            active: Boolean,
            description: String
        }],
        freeShippingThreshold: {
            type: Number,
            default: 0
        }
    },
    emailSettings: {
        fromName: String,
        fromEmail: String,
        smtpHost: String,
        smtpPort: Number,
        smtpUser: String,
        smtpPass: String
    },
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);