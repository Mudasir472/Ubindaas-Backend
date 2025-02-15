const Product = require('../../models/Product');
const SuperCategory = require('../../models/SuperCategory');
const SubCategory = require('../../models/SubCategory');

exports.listProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .populate('superCategory', 'name')
            .populate('subCategory', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments();

        res.render('admin/products/list', {
            products,
            current: page,
            pages: Math.ceil(total / limit),
            title: 'Products'
        });
    } catch (error) {
        req.flash('error_msg', 'Error fetching products');
        res.redirect('/admin/dashboard');
    }
};

exports.createProductForm = async (req, res) => {
    try {
        const superCategories = await SuperCategory.find({ status: 'active' });
        const subCategories = await SubCategory.find({ status: 'active' });

        res.render('admin/products/create', {
            superCategories,
            subCategories,
            title: 'Create Product'
        });
    } catch (error) {
        req.flash('error_msg', 'Error loading form');
        res.redirect('/admin/products');
    }
};

exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            superCategory,
            subCategory,
            price,
            salePrice,
            stock,
            specifications,
            status
        } = req.body;

        // Handle image files
        const images = req.files.map(file => file.filename);

        // Parse specifications
        const parsedSpecs = JSON.parse(specifications);

        await Product.create({
            name,
            description,
            superCategory,
            subCategory,
            price,
            salePrice,
            stock,
            images,
            specifications: parsedSpecs,
            status
        });

        req.flash('success_msg', 'Product created successfully');
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Error creating product:', error);
        req.flash('error_msg', 'Error creating product');
        res.redirect('/admin/products/create');
    }
};

exports.editProductForm = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const superCategories = await SuperCategory.find({ status: 'active' });
        const subCategories = await SubCategory.find({ status: 'active' });

        res.render('admin/products/edit', {
            product,
            superCategories,
            subCategories,
            title: 'Edit Product'
        });
    } catch (error) {
        req.flash('error_msg', 'Error loading product');
        res.redirect('/admin/products');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            superCategory,
            subCategory,
            price,
            salePrice,
            stock,
            specifications,
            status
        } = req.body;

        const product = await Product.findById(req.params.id);

        // Update images if new files uploaded
        let images = product.images;
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.filename);
        }

        // Parse specifications
        const parsedSpecs = JSON.parse(specifications);

        await Product.findByIdAndUpdate(req.params.id, {
            name,
            description,
            superCategory,
            subCategory,
            price,
            salePrice,
            stock,
            images,
            specifications: parsedSpecs,
            status
        });

        req.flash('success_msg', 'Product updated successfully');
        res.redirect('/admin/products');
    } catch (error) {
        req.flash('error_msg', 'Error updating product');
        res.redirect(`/admin/products/edit/${req.params.id}`);
    }
};