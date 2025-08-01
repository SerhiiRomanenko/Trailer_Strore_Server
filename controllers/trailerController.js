// controllers/trailerController.js
const Trailer = require("../models/Trailer");
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

exports.getAllTrailers = async (req, res) => {
    try {
        const trailers = await Trailer.find({});
        const formattedTrailers = trailers.map(formatProductResponse);
        res.status(200).json(formattedTrailers);
    } catch (error) {
        console.error("Помилка при отриманні всіх причепів:", error);
        res.status(500).json({message: "Помилка сервера при отриманні причепів.", error: error.message});
    }
};

exports.createTrailer = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({message: 'Доступ заборонено. Тільки адміністратори можуть додавати причепи.'});
        }

        const newTrailer = new Trailer(req.body);
        const savedTrailer = await newTrailer.save();
        res.status(201).json(formatProductResponse(savedTrailer));
    } catch (error) {
        console.error("Помилка при додаванні нового причепа:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({message: messages.join(', ')});
        }
        res.status(500).json({message: "Помилка сервера при додаванні причепа."});
    }
};

exports.updateTrailer = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({message: 'Доступ заборонено. Тільки адміністратори можуть оновлювати причепи.'});
        }

        const {id} = req.params;
        const updatedTrailer = await Trailer.findByIdAndUpdate(id, req.body, {new: true, runValidators: true});

        if (!updatedTrailer) {
            return res.status(404).json({message: 'Причіп не знайдено'});
        }
        res.status(200).json(formatProductResponse(updatedTrailer));
    } catch (error) {
        console.error("Помилка при оновленні причепа:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({message: 'Невірний ID причепа.'});
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({message: messages.join(', ')});
        }
        res.status(500).json({message: "Помилка сервера при оновленні причепа."});
    }
};

exports.deleteTrailer = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({message: 'Доступ заборонено. Тільки адміністратори можуть видаляти причепи.'});
        }

        const {id} = req.params;
        const trailer = await Trailer.findByIdAndDelete(id);

        if (!trailer) {
            return res.status(404).json({message: 'Причіп не знайдено'});
        }
        res.status(200).json({message: 'Причіп видалено успішно.'});
    } catch (error) {
        console.error("Помилка при видаленні причепа:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({message: 'Невірний ID причепа.'});
        }
        res.status(500).json({message: "Помилка сервера при видаленні причепа."});
    }
};

exports.getTrailerById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({message: 'Невірний формат ID.'});
        }

        const trailer = await Trailer.findById(req.params.id);
        if (!trailer) {
            return res.status(404).json({message: "Причіп не знайдено за ID."});
        }
        res.status(200).json(formatProductResponse(trailer));
    } catch (error) {
        console.error("Помилка при отриманні причепа за ID:", error);
        res.status(500).json({message: "Помилка сервера при отриманні причепа.", error: error.message});
    }
};

exports.getTrailerBySlug = async (req, res) => {
    try {
        const {slug} = req.params;
        const trailer = await Trailer.findOne({slug: slug});
        if (!trailer) {
            return res.status(404).json({message: "Причіп не знайдено за slug."});
        }
        res.status(200).json(formatProductResponse(trailer));
    } catch (error) {
        console.error("Помилка при отриманні причепа за slug:", error);
        res.status(500).json({message: "Помилка сервера при отриманні причепа за slug.", error: error.message});
    }
};