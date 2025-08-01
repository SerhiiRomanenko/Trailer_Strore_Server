// routes/componentRoutes.js
const express = require('express');
const router = express.Router();
const componentController = require('../controllers/componentController');
const {protect, authorizeRoles} = require('../middleware/auth');

router.get('/', componentController.getAllComponents);
router.get('/:id', componentController.getComponentById);

router.post('/', protect, authorizeRoles('admin'), componentController.addComponent);
router.put('/:id', protect, authorizeRoles('admin'), componentController.updateComponent);
router.delete('/:id', protect, authorizeRoles('admin'), componentController.deleteComponent);

module.exports = router;