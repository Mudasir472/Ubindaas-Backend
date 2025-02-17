const Order = require('../../models/Order');
const Product = require('../../models/Product');

// List all orders
exports.listOrders = async (req, res) => {
    try {
        const status = req.query.status;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('items.product')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalOrders = await Order.countDocuments(query);

        res.render('admin/orders/list', {
            orders,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            status: status || 'all',
            title: 'Orders Management'
        });
    } catch (error) {
        console.error('Error in listOrders:', error);
        req.flash('error_msg', 'Error fetching orders');
        res.redirect('/admin/dashboard');
    }
};

// View single order
exports.viewOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product');

        if (!order) {
            req.flash('error_msg', 'Order not found');
            return res.redirect('/admin/orders');
        }

        res.render('admin/orders/view', {
            order,
            title: `Order #${order.orderId}`
        });
    } catch (error) {
        console.error('Error in viewOrder:', error);
        req.flash('error_msg', 'Error loading order');
        res.redirect('/admin/orders');
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        order.status = status;
        if (notes) order.notes = notes;
        await order.save();

        return res.json({ 
            success: true, 
            message: 'Order status updated successfully' 
        });
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error updating order status' 
        });
    }
};

// Update tracking info
exports.updateTracking = async (req, res) => {
    try {
        const { courier, trackingId, url } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        order.trackingInfo = { courier, trackingId, url };
        order.status = 'shipped';
        await order.save();

        return res.json({ 
            success: true, 
            message: 'Tracking information updated successfully' 
        });
    } catch (error) {
        console.error('Error in updateTracking:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error updating tracking information' 
        });
    }
};


// Add this function temporarily for testing
exports.createTestOrder = async (req, res) => {
    try {
        const order = await Order.create({
            customer: {
                name: 'Test Customer',
                email: 'test@example.com',
                phone: '1234567890'
            },
            items: [{
                product: '67b2b046f46fa0d28503c201', // Replace with an actual product ID from your database
                quantity: 2,
                price: 999,
                size: 'M',
                color: 'Blue'
            }],
            shippingAddress: {
                street: '123 Test Street',
                city: 'Test City',
                state: 'Test State',
                pincode: '123456'
            },
            totalAmount: 1998,
            paymentMethod: 'cod'
        });

        res.json({ success: true, order });
    } catch (error) {
        console.error('Error creating test order:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};