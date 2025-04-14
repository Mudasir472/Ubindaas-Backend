const Category = require('../../models/Category');
const Product = require('../../models/Product');
const Rating = require('../../models/Rating');

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
        const minRating = parseInt(req.query.minRating) || 0;

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

        // Filter by minimum rating if specified
        if (minRating > 0) {
            query.averageRating = { $gte: minRating };
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

exports.getAllProductsCategory = async (req, res) => {
    try {
        const { gender, name } = req.query;

        if (!gender || !name) {
            return res.status(400).json({ message: "Gender and name are required." });
        }

        const category = await Category.findOne({
            gender: gender.toLowerCase(),
            name: { $regex: new RegExp(`^${name}$`, 'i') } // case-insensitive exact match
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const products = await Product.find({ category: category._id });

        res.status(200).json({ data: products });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getProductsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;

        // Build query
        const query = {
            category: categoryId,
            status: 'active'
        };

        // Get total count
        const total = await Product.countDocuments(query);

        // Execute query
        const products = await Product.find(query)
            .populate('category')
            .sort({ createdAt: -1 })
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
        console.error('Error in getProductsByCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products by category'
        });
    }
};

exports.getFeaturedProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;

        const products = await Product.find({
            featured: true,
            status: 'active'
        })
            .populate('category')
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error in getFeaturedProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured products'
        });
    }
};

// New method to get top-rated products
exports.getTopRatedProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const minRating = parseFloat(req.query.minRating) || 4.0;
        const minReviews = parseInt(req.query.minReviews) || 1;

        const products = await Product.find({
            status: 'active',
            averageRating: { $gte: minRating },
            ratingCount: { $gte: minReviews }
        })
            .populate('category')
            .sort({ averageRating: -1, ratingCount: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error in getTopRatedProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching top-rated products'
        });
    }
};

// Get product ratings
exports.getProductRatings = async (req, res) => {
    try {
        const productId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        // Get approved ratings for the product
        const ratings = await Rating.find({
            productId: productId,
            status: 'approved'
        })
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Get total count
        const total = await Rating.countDocuments({
            productId: productId,
            status: 'approved'
        });

        // Get rating distribution
        const distribution = await Rating.aggregate([
            { $match: { productId: mongoose.Types.ObjectId(productId), status: 'approved' } },
            { $group: { _id: '$rating', count: { $sum: 1 } } }
        ]);

        // Format distribution
        const formattedDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        distribution.forEach(item => {
            formattedDistribution[item._id] = item.count;
        });

        res.json({
            success: true,
            data: {
                ratings,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                total,
                distribution: formattedDistribution
            }
        });
    } catch (error) {
        console.error('Error in getProductRatings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product ratings'
        });
    }
};