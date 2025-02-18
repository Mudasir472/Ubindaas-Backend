const Order = require('../../models/Order');
const Product = require('../../models/Product');
const Customer = require('../../models/Customer');

exports.getStats = async (req, res) => {
    try {
        // Get total counts
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalCustomers = await Customer.countDocuments();

        // Get revenue
        const orders = await Order.find();
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Get today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = await Order.find({ createdAt: { $gte: today } });
        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        res.json({
            success: true,
            data: {
                totalOrders,
                totalProducts,
                totalCustomers,
                totalRevenue,
                todayOrders: todayOrders.length,
                todayRevenue
            }
        });
    } catch (error) {
        console.error('Error in getStats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats'
        });
    }
};

exports.getRecentOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('items.product');

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error in getRecentOrders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent orders'
        });
    }
};

exports.getTopProducts = async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    totalQuantity: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" }
        ]);

        res.json({
            success: true,
            data: topProducts
        });
    } catch (error) {
        console.error('Error in getTopProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching top products'
        });
    }
};

exports.getRevenue = async (req, res) => {
    try {
        const monthlyRevenue = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    total: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.json({
            success: true,
            data: monthlyRevenue
        });
    } catch (error) {
        console.error('Error in getRevenue:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching revenue data'
        });
    }
};