const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    message: {
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Unread', 'Read'], default: 'Unread' 
    }
}, { timestamps: true });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
