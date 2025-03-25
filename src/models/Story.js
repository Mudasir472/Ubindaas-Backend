
const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    image: {
        type: String,
        default: null
    },
    video: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },

    products: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);