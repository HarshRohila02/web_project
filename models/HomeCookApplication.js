const mongoose = require('mongoose');

const homeCookApplicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true },
    licenceStatus: { 
        type: String, 
        enum: ['yes', 'no', 'assistance'],
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HomeCookApplication', homeCookApplicationSchema);

