exports.getLogin = (req, res) => {
    // Add console log for debugging
    console.log('Session:', req.session);
    
    if (req.session.userId) {
        console.log('User is already logged in, redirecting to dashboard');
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/auth/login', { 
        error_msg: req.flash('error_msg'),
        success_msg: req.flash('success_msg')
    });
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email, password });

        // Hardcoded admin credentials
        const ADMIN_EMAIL = 'admin@ubindass.com';
        const ADMIN_PASSWORD = 'admin123';

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Set session data
            req.session.userId = 'admin';
            req.session.userRole = 'admin';
            req.session.user = {
                name: 'Admin',
                email: ADMIN_EMAIL,
                role: 'admin'
            };
            
            // Save session explicitly
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    req.flash('error_msg', 'Error during login');
                    return res.redirect('/admin/login');
                }
                
                console.log('Session saved:', req.session);
                req.flash('success_msg', 'Successfully logged in');
                return res.redirect('/admin/dashboard');
            });
        } else {
            console.log('Invalid credentials');
            req.flash('error_msg', 'Invalid email or password');
            res.redirect('/admin/login');
        }
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error_msg', 'An error occurred during login');
        res.redirect('/admin/login');
    }
};

exports.getDashboard = async (req, res) => {
    console.log('Dashboard access attempt. Session:', req.session);
    
    try {
        if (!req.session.userId) {
            console.log('No session, redirecting to login');
            return res.redirect('/admin/login');
        }

        const adminUser = {
            name: 'Admin',
            email: 'admin@ubindass.com',
            role: 'admin'
        };

        res.render('admin/dashboard/index', {
            user: adminUser,
            title: 'Dashboard'
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error_msg', 'Error loading dashboard');
        res.redirect('/admin/login');
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/admin/login');
    });
};