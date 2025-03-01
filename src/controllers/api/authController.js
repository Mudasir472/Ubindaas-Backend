const jwt = require('jsonwebtoken');
const Customer = require('../../models/Customer.js');

exports.register = async (req, res) => {
    res.json({ message: "User registered successfully!" });
};

exports.login = async (req, res) => {
    res.json({ message: "User logged in successfully!" });
};

exports.forgotPassword = async (req, res) => {
    res.json({ message: "Password reset link sent!" });
};

exports.resetPassword = async (req, res) => {
    res.json({ message: "Password reset successfully!" });
};

exports.verifyEmail = async (req, res) => {
    res.json({ message: "Email verified successfully!" });
};

exports.protect = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Please authenticate' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const customer = await Customer.findById(decoded.id);
        if (!customer) {
            return res.status(401).json({ success: false, message: 'Please authenticate' });
        }
        if (customer.status !== 'active') {
            return res.status(403).json({ success: false, message: 'Account is inactive' });
        }
        req.customer = customer;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ success: false, message: 'Please authenticate' });
    }
};
