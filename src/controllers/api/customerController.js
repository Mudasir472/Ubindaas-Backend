const Customer = require('../../models/Customer');
const Order = require('../../models/Order');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Product = require('../../models/Product');

// Get customer profile
exports.getProfile = async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id).select('-password');
        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
};

// Update customer profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!email || !name || !phone) {
            return res.status(302).json({
                success: false,
                message: "Enter all the fields"
            })
        }
        const customer = await User.findByIdAndUpdate(
            req.user._id,
            { name, email, phone },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            user: customer
        });
    } catch (error) {
        console.error('Error in updateProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, req.user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await User.findByIdAndUpdate(req.user._id, {
            password: hashedPassword
        });
        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error in changePassword:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
};

// Address management
exports.getAddresses = async (req, res) => {

    try {
        const customer = await User.findById(req.user._id).select('addresses');
        if (!customer) {
            return res.status(403).json({
                success: false,
                message: "You are not customer"
            })
        }
        return res.json({
            success: true,
            data: customer.addresses
        });
    } catch (error) {
        console.error('Error in getAddresses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching addresses'
        });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const { type, street, city, state, pincode, isDefault } = req.body;
        const customer = await User.findById(req.user._id);
        // If new address is default, remove default from others
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }
        if (!customer.addresses) {
            customer.addresses = [];
        }
        if (isDefault) {
            customer.addresses = customer.addresses.map(addr => ({ ...addr, isDefault: false }));
        }
        const isDuplicate = customer.addresses.some(addr =>
            addr.street === street && addr.city === city && addr.state === state && addr.pincode === pincode
        );

        if (isDuplicate) {
            return res.status(400).json({ success: false, message: "Address already exists" });
        }
        customer.addresses.push({ type, street, city, state, pincode, isDefault });

        await customer.save();

        return res.status(200).json({
            success: true,
            data: customer.addresses
        });
    } catch (error) {
        console.error('Error in addAddress:', error);
        res.status(500).json({
            success: false,
            err: error.message,
            message: 'Error adding address'
        });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const { type, street, city, state, pincode, isDefault } = req.body;
        const addressId = req.params.id;

        const customer = await Customer.findById(req.customer._id);
        const address = customer.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // If updating to default, remove default from others
        if (isDefault && !address.isDefault) {
            customer.addresses.forEach(addr => addr.isDefault = false);
        }

        // Update address
        address.set({
            type,
            street,
            city,
            state,
            pincode,
            isDefault
        });

        await customer.save();

        res.json({
            success: true,
            data: customer.addresses
        });
    } catch (error) {
        console.error('Error in updateAddress:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating address'
        });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const customer = await User.findById(req.user._id);
        customer.addresses.pull(req.params.id);
        await customer.save();

        res.json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteAddress:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting address'
        });
    }
};

// Order management
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.customer._id })
            .sort({ createdAt: -1 })
            .populate('items.product');

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error in getOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            customer: req.customer._id
        }).populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error in getOrderDetails:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order details'
        });
    }
};

// getWishlist
exports.getWishlist = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

exports.addToWishlist = async (req, res) => {
    try {

        const { productId, userId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Find the user and update the wishlist
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ success: false, message: "Product already in wishlist" });
        }

        user.wishlist.push(productId);
        await user.save();

        res.status(200).json({ success: true, message: "Product added to wishlist" });
    } catch (error) {
        console.error("Wishlist Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
