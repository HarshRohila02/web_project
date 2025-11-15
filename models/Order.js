const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    deliveryOption: { type: String, default: 'pickup' },
    deliveryAddress: { type: String },
    customerName: { type: String },
    customerEmail: { type: String },
    customerPhone: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);

