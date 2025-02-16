const Category = require('../../models/Category');

// List categories
exports.listCategories = async (req, res) => {
    try {
        console.log('Accessing listCategories');
        const gender = req.query.gender || 'men'; // default to men if not specified
        const categories = await Category.find({ gender }).sort({ createdAt: -1 });
        console.log('Gender:', gender);
        console.log('Categories:', categories);
        
        res.render('admin/categories/list', { 
            categories,
            gender,
            title: `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s Categories`,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg'),
            user: req.user || null  // Add user data for sidebar
        });
    } catch (error) {
        req.flash('error_msg', 'Error fetching categories');
        res.redirect('/admin/dashboard');
    }
};

// Show create form
exports.createCategoryForm = async (req, res) => {
    const gender = req.query.gender || 'men';
    res.render('admin/categories/create', { 
        title: 'Create Category',
        gender
    });
};

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, status, gender } = req.body;

        // Check if category already exists for this gender
        const existingCategory = await Category.findOne({ 
            name: name,
            gender: gender
        });

        if (existingCategory) {
            req.flash('error_msg', `Category already exists in ${gender}'s section`);
            return res.redirect('/admin/categories/create?gender=' + gender);
        }

        await Category.create({
            name,
            description,
            status,
            gender
        });

        req.flash('success_msg', 'Category created successfully');
        res.redirect('/admin/categories?gender=' + gender);
    } catch (error) {
        req.flash('error_msg', 'Error creating category');
        res.redirect('/admin/categories/create');
    }
};

// Edit form
exports.editCategoryForm = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            req.flash('error_msg', 'Category not found');
            return res.redirect('/admin/categories');
        }
        
        res.render('admin/categories/edit', {
            category,
            title: 'Edit Category'
        });
    } catch (error) {
        req.flash('error_msg', 'Error loading category');
        res.redirect('/admin/categories');
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const category = await Category.findById(req.params.id);

        await Category.findByIdAndUpdate(req.params.id, {
            name,
            description,
            status
        });

        req.flash('success_msg', 'Category updated successfully');
        res.redirect('/admin/categories?gender=' + category.gender);
    } catch (error) {
        req.flash('error_msg', 'Error updating category');
        res.redirect('/admin/categories');
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        await Category.findByIdAndDelete(req.params.id);
        
        req.flash('success_msg', 'Category deleted successfully');
        res.redirect('/admin/categories?gender=' + category.gender);
    } catch (error) {
        req.flash('error_msg', 'Error deleting category');
        res.redirect('/admin/categories');
    }
};