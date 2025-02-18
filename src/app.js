const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
require('dotenv').config();

const app = express();

// Import routes
// const adminAuthRoutes = require('./routes/admin/adminAuthRoutes');
const adminAuthRoutes = require('./routes/admin/adminAuthRoutes');
const adminCategoryRoutes = require('./routes/admin/adminCategoryRoutes');
const adminProductRoutes = require('./routes/admin/adminProductRoutes');
const adminOrderRoutes = require('./routes/admin/adminOrderRoutes');
const adminCustomerRoutes = require('./routes/admin/adminCustomerRoutes');
const adminDashboardRoutes = require('./routes/admin/adminDashboardRoutes'); 
const adminSettingRoutes = require('./routes/admin/adminSettingRoutes');
//const { errorHandler, notFound } = require('./middlewares/errorMiddleware');


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(morgan('dev'));
app.use(methodOverride('_method'));
// // Error Handling
// app.use(notFound);
// app.use(errorHandler);


// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Session Setup with more detailed configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.user = req.session.user || null;
    next();
});

// Routes
app.use('/admin', adminAuthRoutes);
app.use('/admin/dashboard', adminDashboardRoutes); 
app.use('/admin/categories', adminCategoryRoutes);
app.use('/admin/products', adminProductRoutes);
app.use('/admin/orders', adminOrderRoutes);
app.use('/admin/customers', adminCustomerRoutes);
app.use('/admin/settings', adminSettingRoutes);

module.exports = app;