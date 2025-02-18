const Product = require('../../models/Product');

exports.getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const gender = req.query.gender;
        const category = req.query.category;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order || 'desc';

        // Build query
        let query = { status: 'active' };
        
        if (gender) {
            query.gender = gender.toLowerCase();
        }

        if (category) {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Get total count
        const total = await Product.countDocuments(query);

        // Execute query
        const products = await Product.find(query)
            .populate('category')
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(limit);

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
        console.error('Error in getProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error in getProductById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product'
        });
    }
};

exports.getRelatedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const relatedProducts = await Product.find({
            _id: { $ne: product._id },
            category: product.category,
            gender: product.gender,
            status: 'active'
        })
        .limit(4)
        .populate('category');

        res.json({
            success: true,
            data: relatedProducts
        });
    } catch (error) {
        console.error('Error in getRelatedProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching related products'
        });
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const query = req.query.q;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const products = await Product.find({
            $and: [
                { status: 'active' },
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        })
        .populate('category')
        .limit(10);

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error in searchProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching products'
        });
    }
};