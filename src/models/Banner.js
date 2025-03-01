const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Banner title is required'],
        trim: true
    },
    subtitle: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Banner image is required']
    },
    link: {
        type: String,
        trim: true
    },
    buttonText: {
        type: String,
        default: 'Shop Now'
    },
    position: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    forGender: {
        type: String,
        enum: ['men', 'women', 'all'],
        default: 'all'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Banner', BannerSchema);