const jwt = require('jsonwebtoken');
const User = require('../../models/User.js')
const bcrypt = require('bcryptjs')
const Customer = require('../../models/Customer.js');
const key = "MySecretOkDontTouch"
const generateToken = (id) => {
    return jwt.sign({ id }, key, {
        expiresIn: '30d'
    });
};
exports.register = async (req, res) => {
    // res.json({ message: "User registered successfully!" });  
    try {
        const { name, email, password, role, phone } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = new User({ name, email, password, role, phone });
        await user.save();
        const token = generateToken(user._id)
        const result = {
            user,
            authToken: token,
        };
        res.status(200).json({ message: "User created successfully", result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    // res.json({ message: "User logged in successfully!" });
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(401).json({ error: "Invalid Crediantials" });
        }
        // Validate password
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken(existingUser._id)

        const result = {
            user: existingUser,
            authToken: token
        }

        res.status(200).json({ message: "Login successful", result });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
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
