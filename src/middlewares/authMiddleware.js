exports.adminProtect = (req, res, next) => {
    if (!req.session.userId) {
        req.flash('error_msg', 'Please log in to access this page');
        return res.redirect('/admin/login');
    }
    next();
};

exports.redirectIfAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/admin/dashboard');
    }
    next();
};