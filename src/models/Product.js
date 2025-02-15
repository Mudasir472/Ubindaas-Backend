const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    superCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SuperCategory',
        required: true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    images: [{
        type: String,
        required: true
    }],
    specifications: {
        size: [String],
        color: [String],
        material: String,
        other: mongoose.Schema.Types.Mixed
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'out_of_stock'],
        default: 'active'
    },
    sku: {
        type: String,
        unique: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Create slug before saving
productSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
    }
    // Generate SKU if not provided
    if (!this.sku) {
        this.sku = 'PRD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

// Add indexes for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ superCategory: 1, subCategory: 1 });
productSchema.index({ status: 1 });

module.exports = mongoose.model('Product', productSchema);