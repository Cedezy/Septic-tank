const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    technicianId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null 
    }, 
    serviceType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceType',
        required: true
    },
    price: { 
        type: Number,
         required: true
    },
    duration: { 
        type: Number, 
        required: true 
    },
    date: { 
        type: String, 
        required: true 
    },
    time: { 
        type: String, 
        required: true 
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'declined'],
        default: 'pending',
    },
    notes: { 
        type: String
    },
    cancelReason: { 
        type: String, 
        default: null 
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'failed'],
        default: 'unpaid',
    },
    paymentMethod: {
        type: String,
        enum: ['gcash', 'cash'],
        default: 'cash',
    },
    paymongoSourceId: { 
        type: String 
    },
    paymongoCheckoutUrl: { 
        type: String 
    },
    amountPaid: { 
        type: Number 
    },
    proofImages: [
        {
            type: String,
        }
    ],
    receiptNumber: {
        type: String,
        default: null,
    },
    serviceChangeLogs: [
    {
        from: { type: String },
        to: { type: String },
        changedAt: { type: Date, default: Date.now }
    }
],


}, { timestamps: true });


module.exports = mongoose.model('Booking', bookingSchema);
