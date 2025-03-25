const mongoose = require('mongoose');

const OfferBannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Banner title is required'],
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



    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('OfferBanner', OfferBannerSchema);