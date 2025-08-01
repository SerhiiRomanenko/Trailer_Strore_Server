// models/Order.js
const mongoose = require('mongoose');

const productItemSchema = new mongoose.Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    price: {type: Number, required: true},
    quantity: {type: Number, required: true},
    slug: {type: String},
    images: [{type: String}],
    category: {type: String},
    shortDescription: {type: String},
    brand: {type: String},
    currency: {type: String},
});

const orderSchema = new mongoose.Schema({
    id: {type: String, required: true, unique: true},
    date: {type: Date, default: Date.now},
    customer: {
        name: {type: String, required: true},
        email: {type: String, required: true},
        phone: {type: String, required: true},
    },
    delivery: {
        method: {type: String, enum: ["pickup", "nova-poshta"], required: true},
        cityRef: {type: String},
        cityName: {type: String},
        branchRef: {type: String},
        branchName: {type: String},
    },
    payment: {
        method: {type: String, enum: ["cash", "card"], required: true},
    },
    items: [productItemSchema],
    total: {type: Number, required: true},
    status: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Processing",
    },
    userId: {type: String, ref: 'User', required: false},
}, {timestamps: true});

module.exports = mongoose.model('Order', orderSchema);
