// controllers/componentController.js
const Component = require('../models/Component');
const mongoose = require('mongoose');

const formatProductResponse = (product) => {
    if (!product) return null;
    const productObject = product.toObject({getters: true, virtuals: false});
    return {
        id: productObject._id.toString(),
        ...productObject,
        _id: undefined,
        __v: undefined
    };
};

exports.getAllComponents = async (req, res) => {
    try {
        const components = await Component.find({});
        const formattedComponents = components.map(formatProductResponse);
        res.status(200).json(formattedComponents);
    } catch (error) {
        console.error("Помилка при отриманні всіх комплектуючих:", error);
        res.status(500).json({message: 'Помилка сервера при отриманні комплектуючих.', error: error.message});
    }
};

exports.getComponentById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({message: 'Невірний формат ID комплектуючої.'});
        }
        const component = await Component.findById(req.params.id);
        if (!component) {
            return res.status(404).json({message: 'Комплектуюча не знайдено.'});
        }
        res.status(200).json(formatProductResponse(component));
    } catch (error) {
        console.error("Помилка при отриманні комплектуючої за ID:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({message: 'Невірний ID комплектуючої.'});
        }
        res.status(500).json({message: 'Помилка сервера при отриманні комплектуючої.'});
    }
};

exports.addComponent = async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({message: 'Доступ заборонено. Тільки адміністратори можуть додавати комплектуючі.'});
    }
    console.log("Користувач з роллю:", req.user.role, "намагається додати комплектуючу.");
    console.log("Received data for new component:", req.body);

    try {
        const newComponent = new Component(req.body);
        const savedComponent = await newComponent.save();
        res.status(201).json(formatProductResponse(savedComponent));
    } catch (error) {
        console.error("Detailed error during addComponent:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({message: messages.join(', ')});
        }
        res.status(500).json({message: 'Помилка сервера при додаванні комплектуючої.', error: error.message});
    }
};

exports.updateComponent = async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({message: 'Доступ заборонено. Тільки адміністратори можуть оновлювати комплектуючі.'});
    }
    console.log("Користувач з роллю:", req.user.role, "намагається оновити комплектуючу.");

    const {id} = req.params;

    try {
        const updatedComponent = await Component.findByIdAndUpdate(
            id,
            req.body,
            {new: true, runValidators: true}
        );

        if (!updatedComponent) {
            return res.status(404).json({message: 'Комплектуюча не знайдено.'});
        }
        res.status(200).json(formatProductResponse(updatedComponent));
    } catch (error) {
        console.error("Помилка при оновленні комплектуючої:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({message: 'Невірний ID комплектуючої.'});
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({message: messages.join(', ')});
        }
        res.status(500).json({message: 'Помилка сервера при оновленні комплектуючої.', error: error.message});
    }
};

exports.deleteComponent = async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({message: 'Доступ заборонено. Тільки адміністратори можуть видаляти комплектуючі.'});
    }
    console.log("Користувач з роллю:", req.user.role, "намагається видалити комплектуючу.");

    const {id} = req.params;

    try {
        const deletedComponent = await Component.findByIdAndDelete(id);
        if (!deletedComponent) {
            return res.status(404).json({message: 'Комплектуюча не знайдено.'});
        }
        res.status(200).json({message: 'Комплектуючу успішно видалено.'});
    } catch (error) {
        console.error("Помилка при видаленні комплектуючої:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({message: 'Невірний ID комплектуючої.'});
        }
        res.status(500).json({message: 'Помилка сервера при видаленні комплектуючої.', error: error.message});
    }
};
