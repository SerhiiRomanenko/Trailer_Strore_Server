// routes/trailerRoutes.js
const express = require("express");
const {
    createTrailer,
    getAllTrailers,
    getTrailerById,
    updateTrailer,
    deleteTrailer,
    getTrailerBySlug
} = require("../controllers/trailerController");
const {protect, authorizeRoles} = require('../middleware/auth');

const router = express.Router();

// Маршрути для причепів
router.get("/", getAllTrailers);
router.get("/:id", getTrailerById);
router.get("/slug/:slug", getTrailerBySlug);

router.post("/", protect, authorizeRoles('admin'), createTrailer);
router.put("/:id", protect, authorizeRoles('admin'), updateTrailer);
router.delete("/:id", protect, authorizeRoles('admin'), deleteTrailer);

module.exports = router;