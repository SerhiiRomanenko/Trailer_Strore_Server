const User = require('../models/User');
const {v4: uuidv4} = require('uuid');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error("Помилка при отриманні всіх користувачів:", error);
        res.status(500).json({message: 'Помилка сервера при отриманні користувачів.', error: error.message});
    }
};

exports.getUserById = async (req, res) => {
    const {id} = req.params;

    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({message: 'Користувача не знайдено.'});
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Помилка при отриманні користувача за ID:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({message: 'Невірний формат ID користувача.'});
        }
        res.status(500).json({message: 'Помилка сервера при отриманні користувача.', error: error.message});
    }
};

exports.updateUser = async (req, res) => {
    const {id} = req.params;
    const {name, email, role, avatar} = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({message: 'Користувача не знайдено.'});
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) {
            if (email !== user.email) {
                const emailExists = await User.findOne({email});
                if (emailExists && String(emailExists._id) !== String(user._id)) {
                    return res.status(400).json({message: 'Цей email вже зареєстрований іншим користувачем.'});
                }
            }
            user.email = email;
        }
        if (role !== undefined) user.role = role;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        res.status(200).json({
            message: 'Користувача успішно оновлено.',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error("Помилка при оновленні користувача:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({message: messages.join(', ')});
        }
        if (error.name === 'CastError') {
            return res.status(400).json({message: 'Невірний формат ID користувача.'});
        }
        res.status(500).json({message: 'Помилка сервера при оновленні користувача.', error: error.message});
    }
};

exports.deleteUser = async (req, res) => {
    const {id} = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({message: 'Користувача не знайдено.'});
        }

        res.status(200).json({message: 'Користувача успішно видалено.'});
    } catch (error) {
        console.error("Помилка при видаленні користувача:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({message: 'Невірний формат ID користувача.'});
        }
        res.status(500).json({message: 'Помилка сервера при видаленні користувача.', error: error.message});
    }
};
