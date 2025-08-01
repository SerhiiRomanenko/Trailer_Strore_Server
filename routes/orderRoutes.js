// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// ROUTE: CREATE ORDER (POST /api/orders)
router.post('/', orderController.createOrder);

// ROUTE: GET MY ORDERS (GET /api/orders/my-orders)
router.get('/my-orders', authMiddleware.protect, orderController.getMyOrders);

// ROUTE: GET ALL ORDERS (GET /api/orders)
router.get('/', authMiddleware.protect, authMiddleware.authorizeRoles('admin'), orderController.getAllOrders);

// NEW ROUTE: GET A SINGLE ORDER BY ID (GET /api/orders/:orderId)
router.get('/:orderId', authMiddleware.protect, authMiddleware.authorizeRoles('admin'), orderController.getOrderById);

// Update order status (for admin)
router.put('/:orderId/status', authMiddleware.protect, authMiddleware.authorizeRoles('admin'), orderController.updateOrderStatus);

// Delete an order (for admin)
router.delete('/:orderId', authMiddleware.protect, authMiddleware.authorizeRoles('admin'), orderController.deleteOrder);

module.exports = router;
