const mongoose = require('mongoose');

const technicianStatusSchema = new mongoose.Schema({
    technicianId: { type: 
        mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    status: {
        type: String,
        enum: ['available', 'unavailable'],
        default: 'available',
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('TechnicianStatus', technicianStatusSchema);
