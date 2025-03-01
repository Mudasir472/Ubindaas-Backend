// Error Handler Middleware
exports.errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Check if the request is an API call
    const isApiRequest = req.originalUrl.startsWith('/api/');

    // MongoDB Duplicate Key Error
    if (err.code === 11000) {
        if (isApiRequest) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate field value entered'
            });
        }
        req.flash('error_msg', 'Duplicate field value entered');
        return res.redirect('back');
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        if (isApiRequest) {
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        req.flash('error_msg', messages.join(', '));
        return res.redirect('back');
    }

    // JWT Error
    if (err.name === 'JsonWebTokenError') {
        if (isApiRequest) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                redirect: '/admin/login'
            });
        }
        req.flash('error_msg', 'Session invalid. Please login again.');
        return res.redirect('/admin/login');
    }

    // JWT Expire Error
    if (err.name === 'TokenExpiredError') {
        if (isApiRequest) {
            return res.status(401).json({
                success: false,
                message: 'Session expired',
                redirect: '/admin/login'
            });
        }
        req.flash('error_msg', 'Session expired. Please login again.');
        return res.redirect('/admin/login');
    }

    // Default Error
    if (isApiRequest) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Server Error'
        });
    }

    req.flash('error_msg', err.message || 'Server Error');
    res.redirect('/admin/login');
};

// Not Found Middleware
exports.notFound = (req, res, next) => {
    const isApiRequest = req.originalUrl.startsWith('/api/');
    
    if (isApiRequest) {
        return res.status(404).json({
            success: false,
            message: `Not Found - ${req.originalUrl}`
        });
    }

    req.flash('error_msg', `Page Not Found - ${req.originalUrl}`);
    res.status(404).redirect('/admin/login');
};