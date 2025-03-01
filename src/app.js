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

// Import Admin routes
const adminAuthRoutes = require('./routes/admin/adminAuthRoutes');
const adminDashboardRoutes = require('./routes/admin/adminDashboardRoutes');
const adminCategoryRoutes = require('./routes/admin/adminCategoryRoutes');
const adminProductRoutes = require('./routes/admin/adminProductRoutes');
const adminOrderRoutes = require('./routes/admin/adminOrderRoutes');
const adminCustomerRoutes = require('./routes/admin/adminCustomerRoutes');
const adminSettingRoutes = require('./routes/admin/adminSettingRoutes');
const adminBannerRoutes = require('./routes/admin/adminBannerRoutes');
const adminRatingRoutes = require('./routes/admin/adminRatingRoutes'); // New rating routes

// Import API routes
const apiAuthRoutes = require('./routes/api/authRoutes');
const apiCategoryRoutes = require('./routes/api/categoryRoutes');
const apiDashboardRoutes = require('./routes/api/dashboardRoutes');
const apiOrderRoutes = require('./routes/api/orderRoutes');
const apiPaymentRoutes = require('./routes/api/paymentRoutes');
const apiProductRoutes = require('./routes/api/productRoutes');
const apiSettingRoutes = require('./routes/api/settingRoutes');
const bannerApiRoutes = require('./routes/api/bannerRoutes');
const ratingApiRoutes = require('./routes/api/ratingRoutes'); // New rating API routes

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(morgan('dev'));
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.session.user || null;
    next();
});

// Admin Routes
app.use('/admin', adminAuthRoutes);
app.use('/admin/dashboard', adminDashboardRoutes);
app.use('/admin/categories', adminCategoryRoutes);
app.use('/admin/products', adminProductRoutes);
app.use('/admin/orders', adminOrderRoutes);
app.use('/admin/customers', adminCustomerRoutes);
app.use('/admin/settings', adminSettingRoutes);
app.use('/admin/banners', adminBannerRoutes);
app.use('/admin/ratings', adminRatingRoutes); // Added admin rating routes

// API Routes
app.use('/api/auth', apiAuthRoutes);
app.use('/api/categories', apiCategoryRoutes);
app.use('/api/dashboard', apiDashboardRoutes);
app.use('/api/orders', apiOrderRoutes);
app.use('/api/payments', apiPaymentRoutes);
app.use('/api/products', apiProductRoutes);
app.use('/api/settings', apiSettingRoutes);
app.use('/api/banners', bannerApiRoutes);
app.use('/api/ratings', ratingApiRoutes); // Added API rating routes

// Base route
app.get('/', (req, res) => {
    res.redirect('/admin/login');
});

// Error Handling Middleware
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

module.exports = app;