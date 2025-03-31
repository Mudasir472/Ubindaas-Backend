const Order = require('../../models/Order');
const Product = require('../../models/Product');
const mongoose = require('mongoose');
const sendEmail = require('../../services/emailService');
const User = require('../../models/User');
exports.createOrder = async (req, res) => {
    try {
        const {
            shippingAddress,
            paymentMethod,
            totalAmount
        } = req.body;
        // console.log(items);
        const items = req.body.items
            .map(item => {
                if (!mongoose.Types.ObjectId.isValid(item.product)) {
                    console.error("Invalid product ID:", item.product);
                    return {
                        product: null,
                        quantity: item.quantity,
                        price: item.price,
                        size: item?.size || null,
                        color: item?.color || null
                    }
                }

                return {
                    product: new mongoose.Types.ObjectId(item.product), // Convert to ObjectId
                    quantity: item.quantity,
                    price: item.price,
                    size: item?.size || null,
                    color: item?.color || null
                };
            })
            .filter(item => item !== null);

        // Validate stock
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} is out of stock`
                });
            }
        }

        // Create order
        const order = await Order.create({
            customer: req.user._id,
            items,
            shippingAddress,
            paymentMethod,
            totalAmount,
            status: 'pending',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'
        });


        // Update product stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }
        console.log(items);


        const customer = await User.findById(req.user._id);
        if (customer) {
            const emailContent = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #4CAF50;">Order Confirmation</h2>
            <p>Dear <strong>${customer.name}</strong>,</p>
            <p>Your order has been confirmed!</p>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
            <p>Thank you for shopping with us!</p>
          </body>
        </html>
      `;

            await sendEmail(customer.email, "Order Confirmation", emailContent);  //sending update
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error in createOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order'
        });
    }
};
exports.getUserOrders = async (req, res) => {
    try {
        const allOrders = await Order.find({})
            .populate({
                path: 'items',

            })
            .populate({
                path: 'items.product',
                model: 'Product'
            })
            .populate('customer');

        if (!allOrders) {
            return res.status(400).json({
                success: false,
                message: "Not any Order yet"
            })
        }
        return res.status(200).json({
            success: true,
            orders: allOrders
        })

    } catch (err) {
        console.log(err);

    }
}
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product');

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
        console.error('Error in getOrderById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order'
        });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled'
            });
        }

        // Update order status
        order.status = 'cancelled';
        await order.save();

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Error in cancelOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling order'
        });
    }
};

exports.trackOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .select('status trackingInfo createdAt updatedAt');

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
        console.error('Error in trackOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Error tracking order'
        });
    }
};