const mongoose = require('mongoose');

const serviceTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },

    price: {
        type: Number,
        required: true,
    },

    duration: {
        type: Number, // in hours
        required: true,
    },

    status: {
        type: String,
        enum: ['Active', 'Disabled'],
        default: 'Active',
    },

    images: {
        type: [String],
        default: []
    },

    showOnHome: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model('ServiceType', serviceTypeSchema);
