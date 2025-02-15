const SuperCategory = require('../../models/SuperCategory');
const SubCategory = require('../../models/SubCategory');

// Super Category Controllers
exports.listSuperCategories = async (req, res) => {
    try {
        const superCategories = await SuperCategory.find().sort({ createdAt: -1 });
        res.render('admin/categories/super-list', { 
            superCategories,
            title: 'Super Categories'
        });
    } catch (error) {
        req.flash('error_msg', 'Error fetching categories');
        res.redirect('/admin/dashboard');
    }
};

exports.createSuperCategoryForm = (req, res) => {
    res.render('admin/categories/super-create', { 
        title: 'Create Super Category' 
    });
};

exports.createSuperCategory = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const image = req.file ? req.file.filename : null;

        await SuperCategory.create({
            name,
            description,
            status,
            image
        });

        req.flash('success_msg', 'Super category created successfully');
        res.redirect('/admin/categories/super');
    } catch (error) {
        req.flash('error_msg', 'Error creating category');
        res.redirect('/admin/categories/super/create');
    }
};

// Sub Category Controllers
exports.listSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find()
            .populate('superCategory')
            .sort({ createdAt: -1 });
        res.render('admin/categories/sub-list', { 
            subCategories,
            title: 'Sub Categories'
        });
    } catch (error) {
        req.flash('error_msg', 'Error fetching categories');
        res.redirect('/admin/dashboard');
    }
};

exports.createSubCategoryForm = async (req, res) => {
    try {
        const superCategories = await SuperCategory.find({ status: 'active' });
        res.render('admin/categories/sub-create', {
            superCategories,
            title: 'Create Sub Category'
        });
    } catch (error) {
        req.flash('error_msg', 'Error loading form');
        res.redirect('/admin/categories/sub');
    }
};

exports.createSubCategory = async (req, res) => {
    try {
        const { name, description, superCategory, status } = req.body;
        const image = req.file ? req.file.filename : null;

        await SubCategory.create({
            name,
            description,
            superCategory,
            status,
            image
        });

        req.flash('success_msg', 'Sub category created successfully');
        res.redirect('/admin/categories/sub');
    } catch (error) {
        req.flash('error_msg', 'Error creating category');
        res.redirect('/admin/categories/sub/create');
    }
};