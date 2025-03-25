// src/controllers/admin/adminAuthController.js
module.exports = {
    // Login page
    getLogin: (req, res) => {
        if (req.session.userId) {
            console.log('User is already logged in, redirecting to dashboard');
            return res.redirect('/admin/dashboard');
        }
        res.render('admin/auth/login', { 
            error_msg: req.flash('error_msg'),
            success_msg: req.flash('success_msg')
        });
    },

    // Login process
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const ADMIN_EMAIL = 'admin@ubindass.in';
            const ADMIN_PASSWORD = 'admin123';

            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                req.session.userId = 'admin';
                req.session.userRole = 'admin';
                req.session.user = {
                    name: 'Admin',
                    email: ADMIN_EMAIL,
                    role: 'admin'
                };
                
                req.flash('success_msg', 'Successfully logged in');
                return res.redirect('/admin/dashboard');
            } else {
                req.flash('error_msg', 'Invalid email or password');
                res.redirect('/admin/login');
            }
        } catch (error) {
            console.error('Login error:', error);
            req.flash('error_msg', 'An error occurred during login');
            res.redirect('/admin/login');
        }
    },

    // Logout
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) console.error('Logout error:', err);
            res.redirect('/admin/login');
        });
    }
};