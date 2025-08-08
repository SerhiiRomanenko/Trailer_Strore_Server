// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey";

exports.protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({message: 'Не авторизовано, відсутній токен'});
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Помилка верифікації JWT:", error);
        return res.status(401).json({message: 'Не авторизовано, токен недійсний'});
    }
};

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({message: 'Доступ заборонено. Недостатньо прав.'});
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({message: `Доступ заборонено. Тільки ${roles.join(', ')} можуть виконувати цю дію.`});
        }
        next();
    };
};
