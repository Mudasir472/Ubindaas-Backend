const Customer = require('../../models/Customer');
const Order = require('../../models/Order');

// List customers
exports.listCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const status = req.query.status || 'all';

        let query = {};
        if (status !== 'all') {
            query.status = status;
        }

        const customers = await Customer.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalCustomers = await Customer.countDocuments(query);

        res.render('admin/customers/list', {
            customers,
            currentPage: page,
            totalPages: Math.ceil(totalCustomers / limit),
            status,
            title: 'Customer Management'
        });
    } catch (error) {
        console.error('Error in listCustomers:', error);
        req.flash('error_msg', 'Error fetching customers');
        res.redirect('/admin/dashboard');
    }
};

// View customer details
exports.viewCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            req.flash('error_msg', 'Customer not found');
            return res.redirect('/admin/customers');
        }

        // Get customer's orders
        const orders = await Order.find({ 'customer.email': customer.email })
            .sort({ createdAt: -1 })
            .limit(5);

        res.render('admin/customers/view', {
            customer,
            orders,
            title: 'Customer Details'
        });
    } catch (error) {
        console.error('Error in viewCustomer:', error);
        req.flash('error_msg', 'Error loading customer details');
        res.redirect('/admin/customers');
    }
};

// Update customer status
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        customer.status = status;
        await customer.save();

        return res.json({
            success: true,
            message: 'Customer status updated successfully'
        });
    } catch (error) {
        console.error('Error in updateStatus:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating customer status'
        });
    }
};

// Export customer data
exports.exportCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({})
            .select('-password')
            .sort({ createdAt: -1 });

        // Create CSV data
        const fields = ['name', 'email', 'phone', 'status', 'orderCount', 'totalSpent', 'createdAt'];
        const data = customers.map(customer => ({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            status: customer.status,
            orderCount: customer.orderCount,
            totalSpent: customer.totalSpent,
            createdAt: customer.createdAt.toLocaleDateString()
        }));

        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');

        // Convert to CSV format
        const csvData = [
            fields.join(','),
            ...data.map(row => fields.map(field => row[field]).join(','))
        ].join('\n');

        res.send(csvData);
    } catch (error) {
        console.error('Error in exportCustomers:', error);
        req.flash('error_msg', 'Error exporting customers');
        res.redirect('/admin/customers');
    }
};