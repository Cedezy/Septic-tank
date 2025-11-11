const mongoose = require('mongoose');

const ContactUsSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    facebook: {
        type: String,
        required: false, 
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('ContactUs', ContactUsSchema);
