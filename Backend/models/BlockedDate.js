const mongoose = require('mongoose');

const BlockedDateSchema = new mongoose.Schema({
    date: {
        type: String, 
        required: true,
        unique: true,
    },
    reason: {
        type: String,
        default: 'Unavailable',
    },
}, { timestamps: true });

module.exports = mongoose.model('BlockedDate', BlockedDateSchema);
