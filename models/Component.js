const mongoose = require("mongoose");
const transliterate = require('transliteration').slugify;

const specificationSchema = new mongoose.Schema({
    name: {type: String, required: true},
    value: {type: String, required: true},
    unit: {type: String},
}, {_id: false});

const componentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    slug: {type: String, unique: true},
    description: {type: String},
    shortDescription: {type: String},
    sku: {type: String},
    brand: {type: String},
    model: {type: String},
    category: {type: String, required: true, default: "Комплектуючі"},
    subCategory: {type: String},
    type: {type: String, enum: ["component", "spare_part"], default: "component"},
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

componentSchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = transliterate(this.name, {
            lower: true,
            separator: '-'
        });
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("Component", componentSchema, "components");