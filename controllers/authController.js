// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, email, role) => {
    return jwt.sign({id, email, role}, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

exports.register = async (req, res) => {
    const {name, email, password} = req.body;

    try {
        let user = await User.findOne({email});
        if (user) {
            return res.status(400).json({message: 'Користувач з таким email вже існує.'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
        });
        await user.save();

        const token = generateToken(user._id, user.email, user.role);

        res.status(201).json({
            message: 'Реєстрація успішна.',
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error("Помилка реєстрації користувача:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({message: messages.join(', ')});
        }
        res.status(500).json({message: 'Помилка сервера при реєстрації.'});
    }
};

exports.login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message: 'Невірні облікові дані.'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: 'Невірні облікові дані.'});
        }

        const token = generateToken(user._id, user.email, user.role);

        res.status(200).json({
            message: 'Вхід успішний.',
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error("Помилка входу користувача:", error);
        res.status(500).json({message: 'Помилка сервера при вході.'});
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({message: 'Користувача не знайдено.'});
        }
        res.status(200).json({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        });
    } catch (error) {
        console.error("Помилка при отриманні даних поточного користувача:", error);
        res.status(500).json({message: 'Помилка сервера при отриманні даних користувача.', error: error.message});
    }
};

exports.updateProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({message: 'Не авторизовано. Будь ласка, увійдіть.'});
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({message: 'Користувача не знайдено.'});
        }

        const {name, email, avatar} = req.body;

        if (name !== undefined) {
            user.name = name;
        }

        if (email !== undefined) {
            if (email !== user.email) {
                const emailExists = await User.findOne({email});
                if (emailExists && String(emailExists._id) !== String(user._id)) {
                    return res.status(400).json({message: 'Цей email вже зареєстрований іншим користувачем.'});
                }
            }
            user.email = email;
        }

        if (avatar !== undefined) {
            user.avatar = avatar;
        }

        await user.save();

        const token = generateToken(user._id, user.email, user.role);

        res.status(200).json({
            success: true,
            message: 'Профіль успішно оновлено.',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
            token: token
        });

    } catch (error) {
        console.error("Помилка при оновленні профілю користувача:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({message: messages.join(', ')});
        }
        res.status(500).json({message: 'Помилка сервера при оновленні профілю.', error: error.message});
    }
};

exports.changePassword = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({message: 'Не авторизовано. Будь ласка, увійдіть.'});
    }

    const {oldPassword, newPassword} = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({message: 'Користувача не знайдено.'});
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({message: 'Невірний старий пароль.'});
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        const token = generateToken(user._id, user.email, user.role);

        res.status(200).json({
            success: true,
            message: 'Пароль успішно змінено.',
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error("Помилка при зміні пароля:", error);
        res.status(500).json({message: 'Помилка сервера при зміні пароля.', error: error.message});
    }
};

exports.forgotPassword = async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(200).json({message: 'Якщо користувач з таким email існує, інструкції для відновлення пароля надіслано на вашу пошту.'});
        }

        console.log(`[DEBUG] Інструкції для відновлення пароля надіслано на ${email}`);
        res.status(200).json({message: 'Якщо користувач з таким email існує, інструкції для відновлення пароля надіслано на вашу пошту.'});

    } catch (error) {
        console.error("Помилка при відновленні пароля:", error);
        res.status(500).json({message: 'Помилка сервера при відновленні пароля.', error: error.message});
    }
};
