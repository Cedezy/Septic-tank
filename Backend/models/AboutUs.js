const mongoose = require('mongoose');

const AboutUsSchema = new mongoose.Schema({
    mission: {
        type: String,
        required: true,
    },
    vision: {
        type: String,
        required: true,
    },
    organizationStructure: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('About', AboutUsSchema);
