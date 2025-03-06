const Category = require('../../models/Category');
const Product = require('../../models/Product');

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ status: 'active' });
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error in getCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
};

exports.getCategoriesByGender = async (req, res) => {
    try {
        const { gender } = req.params;
        const categories = await Category.find({
            gender: gender.toLowerCase(),
            status: 'active'
        });
        const formattedCategories = {};

        categories.forEach(cat => {
            if (!formattedCategories[cat.name]) {
                formattedCategories[cat.name] = { subcategories: [] };
            }
            formattedCategories[cat.name].subcategories.push({
                title: cat.subcategoryTitle, // Ensure this exists in your DB
                items: cat.subcategoryItems || [] // Ensure this is an array
            });
        });
        console.log(formattedCategories);

        res.json({
            success: true,
            data: formattedCategories
        });

    } catch (error) {
        console.error('Error in getCategoriesByGender:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
};

exports.getCategoryProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const products = await Product.find({
            category: id,
            status: 'active'
        })
            .populate('category')
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Product.countDocuments({ category: id, status: 'active' });

        res.json({
            success: true,
            data: {
                products,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Error in getCategoryProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
};