// models/Trailer.js
const mongoose = require("mongoose");

const specificationSchema = new mongoose.Schema({
    name: {type: String, required: true},
    value: {type: String, required: true},
    unit: {type: String},
}, {_id: false});

const trailerSchema = new mongoose.Schema({
    name: {type: String, required: true},
    slug: {type: String, unique: true},
    description: {type: String},
    shortDescription: {type: String},
    sku: {type: String},
    brand: {type: String, required: true},
    model: {type: String},
    category: {type: String, required: true, default: "Причепи"},
    subCategory: {type: String},
    type: {type: String, enum: ["trailer"], default: "trailer"},
    price: {type: Number, required: true, min: 0},
    currency: {type: String, default: "UAH"},
    inStock: {type: Boolean, default: true},
    quantity: {type: Number, default: 0, min: 0},
    images: [{type: String}],
    specifications: [specificationSchema],
    compatibility: [{type: String}],
    metaTitle: {type: String},
    metaDescription: {type: String},
    keywords: [{type: String}],
    isFeatured: {type: Boolean, default: false},
}, {timestamps: true});

trailerSchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("Trailer", trailerSchema, "trailers");