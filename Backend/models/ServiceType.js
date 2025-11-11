const mongoose = require('mongoose');

const serviceTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,

    hasTankSize: {
        type: Boolean,
        default: true,
    },

    tankOptions: {
        small: {
            capacity: { type: Number }, 
            price: { type: Number },
            duration: { type: Number } 
        },
        medium: {
            capacity: { type: Number }, 
            price: { type: Number },
            duration: { type: Number }
        },
        large: {
            capacity: { type: Number }, 
            price: { type: Number },
            duration: { type: Number }
        },
        xl: {
            capacity: { type: Number }, 
            price: { type: Number },
            duration: { type: Number }
        }
    },

    fixedPrice: { type: Number },
    fixedDuration: { type: Number }, 

    status: {
        type: String,
        enum: ['Active', 'Disabled'],
        default: 'Active',
    },

    images: {
        type: [String],
    },
    showOnHome: {
        type: Boolean,
        default: false, 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ServiceType', serviceTypeSchema);
