// controllers/orderController.js
const Order = require('../models/Order');
const {v4: uuidv4} = require('uuid');

exports.getAllOrders = async (req, res) => {
    try {
        console.log("Attempting to fetch all orders...");
        const orders = await Order.find().sort({createdAt: -1});
        console.log("Orders fetched successfully:", orders.length);
        res.status(200).json(orders);
    } catch (error) {
        console.error("ПОМИЛКА при отриманні всіх замовлень:", error.message);
        console.error("Деталі помилки:", error);
        res.status(500).json({message: 'Помилка сервера при отриманні замовлень.', error: error.message});
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({id: req.params.orderId});
        if (!order) {
            return res.status(404).json({message: 'Замовлення не знайдено.'});
        }
        res.status(200).json(order);
    } catch (error) {
        console.error("Помилка при отриманні замовлення за ID:", error);
        res.status(500).json({message: 'Помилка сервера при отриманні замовлення.'});
    }
};

exports.createOrder = async (req, res) => {
    const {customer, items, total, delivery, payment} = req.body;

    try {
        if (!customer || !customer.name || !customer.email || !customer.phone) {
            return res.status(400).json({message: 'Дані клієнта (ім\'я, email, телефон) є обов\'язковими.'});
        }
        if (!delivery || !delivery.method) {
            return res.status(400).json({message: 'Метод доставки є обов\'язковим.'});
        }
        if (!payment || !payment.method) {
            return res.status(400).json({message: 'Метод оплати є обов\'язковим.'});
        }
        if (!items || items.length === 0) {
            return res.status(400).json({message: 'Замовлення повинно містити хоча б один товар.'});
        }
        if (total === undefined || total === null) {
            return res.status(400).json({message: 'Загальна сума замовлення є обов\'язковою.'});
        }

        const newOrderData = {
            id: 'order-' + uuidv4(),
            customer: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            },
            delivery: {
                method: delivery.method,
                cityRef: delivery.cityRef || null,
                cityName: delivery.cityName || null,
                branchRef: delivery.branchRef || null,
                branchName: delivery.branchName || null,
            },
            payment: {
                method: payment.method,
            },
            items,
            total,
            status: 'Processing',
            date: new Date()
        };

        if (req.user && req.user.id) {
            newOrderData.userId = req.user.id;
        }

        const newOrder = new Order(newOrderData);

        await newOrder.save();

        console.log('Order successfully saved to DB:', newOrder);
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('ПОМИЛКА при створенні замовлення:', error.message);
        console.error('Деталі помилки (об\'єкт):', error);
        res.status(500).json({message: 'Не вдалося створити замовлення', error: error.message});
    }
};

exports.getMyOrders = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({message: 'Не авторизовано.'});
    }
    try {
        const orders = await Order.find({userId: req.user.id})
            .sort({createdAt: -1});
        res.status(200).json(orders);
    } catch (error) {
        console.error("Помилка при отриманні моїх замовлень:", error);
        res.status(500).json({message: 'Помилка сервера при отриманні моїх замовлень.'});
    }
};

exports.updateOrderStatus = async (req, res) => {
    const {orderId} = req.params;
    const {status} = req.body;

    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({message: "Недійсний статус замовлення."});
    }

    try {
        const order = await Order.findOneAndUpdate(
            {id: orderId},
            {status: status},
            {new: true}
        );

        if (!order) {
            return res.status(404).json({message: 'Замовлення не знайдено.'});
        }

        res.status(200).json({message: 'Статус замовлення успішно оновлено.', order});
    } catch (error) {
        console.error("Помилка при оновленні статусу замовлення:", error);
        res.status(500).json({message: 'Помилка сервера при оновленні статусу замовлення.'});
    }
};

exports.deleteOrder = async (req, res) => {
    const {orderId} = req.params;

    try {
        const deletedOrder = await Order.findOneAndDelete({id: orderId});

        if (!deletedOrder) {
            return res.status(404).json({message: 'Замовлення не знайдено.'});
        }

        res.status(200).json({message: 'Замовлення успішно видалено.'});
    } catch (error) {
        console.error("Помилка при видаленні замовлення:", error);
        res.status(500).json({message: 'Помилка сервера при видаленні замовлення.', error: error.message});
    }
};
