const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['men', 'women', 'unisex'],
        lowercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    salePrice: {
        type: Number,
        min: [0, 'Sale price cannot be negative']
    },
    totalDiscount: {
        type: Number,
    },
    images: {
        type: [String],
        required: [true, 'At least one image is required']
    },
    video: {
        type: String,
        default: null
    },
    sizes: {
        type: [String],
        required: [true, 'At least one size is required']
    },
    colors: {
        type: [Object]
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active'
    },
    featured: {
        type: Boolean,
        default: false
    },
    // New rating fields
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create slug from name and gender before saving
ProductSchema.pre('save', function (next) {
    if (!this.isModified('name') && !this.isModified('gender') && this.slug) {
        return next();
    }
    this.slug = `${this.gender}-${slugify(this.name, { lower: true })}`;
    next();
});

module.exports = mongoose.model('Product', ProductSchema);