const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

exports.protect = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Please authenticate'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const customer = await Customer.findById(decoded.id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Please authenticate'
            });
        }

        // Check if customer is active
        if (customer.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive'
            });
        }

        req.customer = customer;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Please authenticate'
        });
    }
};