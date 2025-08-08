const User = require('../models/User');
const {v4: uuidv4} = require('uuid'); // uuidv4 не використовується в наданому коді, але залишено

exports.getAllUsers = async (req, res) => {
    try {
        // Отримуємо всіх користувачів, виключаючи паролі
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error("Помилка при отриманні всіх користувачів:", error);
        res.status(500).json({message: 'Помилка сервера при отриманні користувачів.', error: error.message});
    }
};

exports.getUserById = async (req, res) => {
    const {id} = req.params; // ID користувача з URL

    try {
        // Шукаємо користувача за MongoDB _id
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({message: 'Користувача не знайдено.'});
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Помилка при отриманні користувача за ID:", error);
        // Додаємо обробку помилки CastError, якщо ID має неправильний формат
        if (error.name === 'CastError') {
            return res.status(400).json({message: 'Невірний формат ID користувача.'});
        }
        res.status(500).json({message: 'Помилка сервера при отриманні користувача.', error: error.message});
    }
};

exports.updateUser = async (req, res) => {
    const {id} = req.params; // ID користувача, якого потрібно оновити
    const {name, email, role, avatar} = req.body; // Дані для оновлення

    try {
        // Знаходимо користувача за MongoDB _id
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({message: 'Користувача не знайдено.'});
        }

        // Оновлюємо поля, якщо вони надані в тілі запиту
        if (name !== undefined) user.name = name;
        if (email !== undefined) {
            // Перевіряємо, чи змінюється email і чи він вже не існує для іншого користувача
            if (email !== user.email) {
                const emailExists = await User.findOne({email});
                // Порівнюємо _id об'єктів
                if (emailExists && String(emailExists._id) !== String(user._id)) {
                    return res.status(400).json({message: 'Цей email вже зареєстрований іншим користувачем.'});
                }
            }
            user.email = email;
        }
        if (role !== undefined) user.role = role;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save(); // Зберігаємо оновленого користувача

        res.status(200).json({
            message: 'Користувача успішно оновлено.',
            user: {
                id: user._id.toString(), // Повертаємо _id як id
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error("Помилка при оновленні користувача:", error);
        // Обробка помилок валідації Mongoose, якщо є
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({message: messages.join(', ')});
        }
        // Обробка помилки CastError, якщо ID має неправильний формат
        if (error.name === 'CastError') {
            return res.status(400).json({message: 'Невірний формат ID користувача.'});
        }
        res.status(500).json({message: 'Помилка сервера при оновленні користувача.', error: error.message});
    }
};

exports.deleteUser = async (req, res) => {
    const {id} = req.params; // ID користувача, якого потрібно видалити

    try {
        // Знаходимо та видаляємо користувача за MongoDB _id
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({message: 'Користувача не знайдено.'});
        }

        res.status(200).json({message: 'Користувача успішно видалено.'});
    } catch (error) {
        console.error("Помилка при видаленні користувача:", error);
        // Обробка помилки CastError, якщо ID має неправильний формат
        if (error.name === 'CastError') {
            return res.status(400).json({message: 'Невірний формат ID користувача.'});
        }
        res.status(500).json({message: 'Помилка сервера при видаленні користувача.', error: error.message});
    }
};
