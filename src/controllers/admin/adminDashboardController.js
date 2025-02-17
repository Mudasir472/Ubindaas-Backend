const Order = require('../../models/Order');
const Product = require('../../models/Product');
const Customer = require('../../models/Customer');
const Category = require('../../models/Category');

exports.getDashboard = async (req, res) => {
    try {
        // Initialize default stats
        const stats = {
            totalOrders: 0,
            totalProducts: 0,
            totalCustomers: 0,
            totalCategories: 0,
            totalRevenue: 0,
            todayOrders: 0,
            todayRevenue: 0,
            todayCustomers: 0
        };

        // Get count statistics with error handling
        try {
            stats.totalOrders = await Order.countDocuments() || 0;
            stats.totalProducts = await Product.countDocuments() || 0;
            stats.totalCustomers = await Customer.countDocuments() || 0;
            stats.totalCategories = await Category.countDocuments() || 0;
        } catch (err) {
            console.error('Error getting count statistics:', err);
        }

        // Get revenue statistics
        let orders = [];
        try {
            orders = await Order.find() || [];
            stats.totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        } catch (err) {
            console.error('Error getting revenue statistics:', err);
        }

        // Get recent orders
        let recentOrders = [];
        try {
            recentOrders = await Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('items.product') || [];
        } catch (err) {
            console.error('Error getting recent orders:', err);
        }

        // Get low stock products
        let lowStockProducts = [];
        try {
            lowStockProducts = await Product.find({ stock: { $lt: 10 } })
                .sort({ stock: 1 })
                .limit(5) || [];
        } catch (err) {
            console.error('Error getting low stock products:', err);
        }

        // Get today's statistics
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayOrders = await Order.find({ createdAt: { $gte: today } }) || [];
            stats.todayOrders = todayOrders.length;
            stats.todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            stats.todayCustomers = await Customer.countDocuments({ createdAt: { $gte: today } }) || 0;
        } catch (err) {
            console.error('Error getting today statistics:', err);
        }

        // Get monthly revenue data
        let monthlyRevenue = [];
        try {
            monthlyRevenue = await Order.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        total: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
                { $limit: 12 }
            ]) || [];
        } catch (err) {
            console.error('Error getting monthly revenue:', err);
        }

        // Get top selling products
        let topProducts = [];
        try {
            topProducts = await Order.aggregate([
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
            ]) || [];
        } catch (err) {
            console.error('Error getting top products:', err);
        }

        // Render dashboard with all data and error handling
        return res.render('admin/dashboard/index', {
            title: 'Dashboard',
            stats: stats,
            recentOrders: recentOrders,
            lowStockProducts: lowStockProducts,
            monthlyRevenue: monthlyRevenue,
            topProducts: topProducts,
            error: null
        });

    } catch (error) {
        console.error('Error in getDashboard:', error);
        // Render dashboard with default values if error occurs
        return res.render('admin/dashboard/index', {
            title: 'Dashboard',
            stats: {
                totalOrders: 0,
                totalProducts: 0,
                totalCustomers: 0,
                totalCategories: 0,
                totalRevenue: 0,
                todayOrders: 0,
                todayRevenue: 0,
                todayCustomers: 0
            },
            recentOrders: [],
            lowStockProducts: [],
            monthlyRevenue: [],
            topProducts: [],
            error: 'Error loading dashboard data'
        });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        // Initialize default values
        let salesByCategory = [];
        let dailySales = [];

        // Get date range from query or default to last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        try {
            // Get sales by category
            salesByCategory = await Order.aggregate([
                { $unwind: "$items" },
                {
                    $lookup: {
                        from: "products",
                        localField: "items.product",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                { $unwind: "$product" },
                {
                    $lookup: {
                        from: "categories",
                        localField: "product.category",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                { $unwind: "$category" },
                {
                    $group: {
                        _id: "$category.name",
                        totalSales: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                    }
                }
            ]) || [];
        } catch (err) {
            console.error('Error getting sales by category:', err);
        }

        try {
            // Get daily sales data
            dailySales = await Order.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        totalSales: { $sum: "$totalAmount" },
                        orderCount: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]) || [];
        } catch (err) {
            console.error('Error getting daily sales:', err);
        }

        return res.render('admin/dashboard/analytics', {
            title: 'Analytics',
            salesByCategory: salesByCategory,
            dailySales: dailySales,
            error: null
        });

    } catch (error) {
        console.error('Error in getAnalytics:', error);
        return res.render('admin/dashboard/analytics', {
            title: 'Analytics',
            salesByCategory: [],
            dailySales: [],
            error: 'Error loading analytics data'
        });
    }
};