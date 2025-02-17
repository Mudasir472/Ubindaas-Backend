const mongoose = require('mongoose');
const slugify = require('slugify'); // You might need to install this: npm install slugify

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['men', 'women'],
        required: true,
        lowercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number
    },
    images: [{
        type: String,
        required: true
    }],
    sizes: [{
        type: String,
        required: true
    }],
    colors: [{
        name: String,
        code: String
    }],
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'out_of_stock'],
        default: 'active'
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create slug before saving
productSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = slugify(`${this.gender}-${this.name}`, { 
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g
        });
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);