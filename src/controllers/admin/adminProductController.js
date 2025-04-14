const Product = require('../../models/Product');
const Category = require('../../models/Category');
const Rating = require('../../models/Rating');
const fs = require('fs').promises;
const path = require('path');

// Helper function to delete file
const deleteFile = async (filename, isVideo = false) => {
    try {
        const directory = isVideo ? 'videos' : 'products';
        const filePath = path.join(__dirname, `../../public/uploads/${directory}`, filename);
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

// List products
exports.listProducts = async (req, res) => {
    try {
        const gender = (req.query.gender || 'men').toLowerCase();
        console.log('Requesting products for gender:', gender);

        const products = await Product.find({ gender })
            .populate('category')
            .sort({ createdAt: -1 });

        console.log(`Found ${products.length} products`);

        res.render('admin/products/list', {
            products,
            gender,
            title: `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s Products`,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error('Error in listProducts:', error);
        req.flash('error_msg', 'Error fetching products');
        res.redirect('/admin/dashboard');
    }
};

// Show create form
exports.createProductForm = async (req, res) => {
    try {
        const gender = req.query.gender;
        if (!gender || !['men', 'women'].includes(gender.toLowerCase())) {
            req.flash('error_msg', 'Invalid gender specified');
            return res.redirect('/admin/products?gender=men');
        }

        const categories = await Category.find({
            gender: gender.toLowerCase(),
            status: 'active'
        });

        res.render('admin/products/create', {
            categories,
            gender,
            title: `Create ${gender}'s Product`,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error('Error in createProductForm:', error);
        req.flash('error_msg', 'Error loading form');
        res.redirect('/admin/products?gender=men');
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        const gender = req.query.gender || req.body.gender;
        console.log('Creating product with gender from query:', req.query.gender);
        console.log('Creating product with gender from body:', req.body.gender);

        if (!gender || !['men', 'women'].includes(gender.toLowerCase())) {
            console.log('Invalid gender:', gender);
            req.flash('error_msg', 'Invalid gender specified');
            return res.redirect('/admin/products?gender=men');
        }

        const {
            name,
            description,
            category,
            price,
            salePrice,
            sizes,
            colors,
            stock,
            status,
            featured
        } = req.body;

        // Handle images and video
        const images = req.files && req.files.images ? req.files.images.map(file => file.filename) : [];
        const video = req.files && req.files.video && req.files.video.length > 0 ? req.files.video[0].filename : null;

        if (images.length === 0) {
            req.flash('error_msg', 'At least one image is required');
            return res.redirect(`/admin/products/create?gender=${gender}`);
        }
        // Calculate total discount percentage
        let totalDiscount = 0;

        if (price && salePrice && price > 0) {
            totalDiscount = ((price - salePrice) / price) * 100;
            totalDiscount = Math.round(totalDiscount); // Optional: round to nearest whole number
        }
        // Create the product
        const newProduct = await Product.create({
            name,
            description,
            gender: gender.toLowerCase(),
            category,
            price: parseFloat(price),
            salePrice: salePrice ? parseFloat(salePrice) : undefined,
            totalDiscount,
            images,
            video,
            sizes: Array.isArray(sizes) ? sizes : [sizes],
            colors: colors ? JSON.parse(colors) : [],
            stock: parseInt(stock),
            status,
            featured: featured === 'true',
            averageRating: 0,
            ratingCount: 0
        });

        console.log('Created new product:', newProduct);

        req.flash('success_msg', 'Product created successfully');
        res.redirect(`/admin/products?gender=${gender.toLowerCase()}`);
    } catch (error) {
        console.error('Error in createProduct:', error);

        // Clean up uploaded files in case of error
        if (req.files) {
            if (req.files.images) {
                for (const file of req.files.images) {
                    await deleteFile(file.filename);
                }
            }
            if (req.files.video && req.files.video.length > 0) {
                await deleteFile(req.files.video[0].filename, true);
            }
        }

        req.flash('error_msg', 'Error creating product: ' + error.message);
        res.redirect(`/admin/products/create?gender=${req.query.gender}`);
    }
};

// Show edit form
exports.editProductForm = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/admin/products');
        }

        const categories = await Category.find({
            gender: product.gender,
            status: 'active'
        });

        // Get rating information for the product
        const ratingsCount = await Rating.countDocuments({
            productId: product._id,
            status: 'approved'
        });

        res.render('admin/products/edit', {
            product,
            categories,
            ratingsCount,
            title: 'Edit Product',
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error('Error in editProductForm:', error);
        req.flash('error_msg', 'Error loading product');
        res.redirect('/admin/products');
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            price,
            salePrice,
            sizes,
            colors,
            stock,
            status,
            featured,
            existingImages,
            removeVideo
        } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/admin/products');
        }

        // Handle images
        let updatedImages = existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : [];
        const removedImages = product.images.filter(img => !updatedImages.includes(img));

        // Delete removed images
        for (const image of removedImages) {
            await deleteFile(image);
        }

        // Add new images
        if (req.files && req.files.images) {
            updatedImages = [...updatedImages, ...req.files.images.map(file => file.filename)];
        }

        // Handle video
        let videoFilename = product.video;

        // Remove existing video if requested
        if (removeVideo === 'true' && product.video) {
            await deleteFile(product.video, true);
            videoFilename = null;
        }

        // Add new video if uploaded
        if (req.files && req.files.video && req.files.video.length > 0) {
            // Delete old video if exists
            if (product.video) {
                await deleteFile(product.video, true);
            }
            videoFilename = req.files.video[0].filename;
        }

        const updateData = {
            name,
            description,
            category,
            price: parseFloat(price),
            salePrice: salePrice ? parseFloat(salePrice) : undefined,
            sizes: Array.isArray(sizes) ? sizes : [sizes],
            colors: colors ? JSON.parse(colors) : [],
            stock: parseInt(stock),
            status,
            featured: featured === 'true',
            images: updatedImages,
            video: videoFilename
        };

        await Product.findByIdAndUpdate(req.params.id, updateData);
        req.flash('success_msg', 'Product updated successfully');
        res.redirect('/admin/products?gender=' + product.gender);
    } catch (error) {
        console.error('Error in updateProduct:', error);
        req.flash('error_msg', 'Error updating product');
        res.redirect(`/admin/products/edit/${req.params.id}`);
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Delete all associated images
        for (const image of product.images) {
            await deleteFile(image);
        }

        // Delete video if exists
        if (product.video) {
            await deleteFile(product.video, true);
        }

        // Delete all associated ratings
        await Rating.deleteMany({ productId: product._id });

        // Delete the product
        await Product.findByIdAndDelete(req.params.id);

        return res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        return res.status(500).json({ success: false, message: 'Error deleting product' });
    }
};

// Delete single image
exports.deleteProductImage = async (req, res) => {
    try {
        const { id, filename } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check if this is the last image
        if (product.images.length <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete the last image. Product must have at least one image.'
            });
        }

        // Remove image from array and save
        product.images = product.images.filter(img => img !== filename);
        await product.save();

        // Delete file
        await deleteFile(filename);

        res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error in deleteProductImage:', error);
        res.status(500).json({ success: false, message: 'Error deleting image' });
    }
};

// Delete product video
exports.deleteProductVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (!product.video) {
            return res.status(400).json({
                success: false,
                message: 'No video exists for this product'
            });
        }

        // Delete the video file
        await deleteFile(product.video, true);

        // Remove video reference and save
        product.video = null;
        await product.save();

        res.json({ success: true, message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error in deleteProductVideo:', error);
        res.status(500).json({ success: false, message: 'Error deleting video' });
    }
};

// View product ratings
exports.viewProductRatings = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('/admin/products');
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || 'all';

        // Build query
        const query = { productId: productId };
        if (status !== 'all') {
            query.status = status;
        }

        // Get total count
        const total = await Rating.countDocuments(query);

        // Get ratings
        const ratings = await Rating.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.render('admin/products/ratings', {
            product,
            ratings,
            status,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total,
            title: `Ratings for ${product.name}`,
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error('Error in viewProductRatings:', error);
        req.flash('error_msg', 'Error fetching product ratings');
        res.redirect('/admin/products');
    }
};

// Update rating status
exports.updateRatingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const rating = await Rating.findById(id);

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        // Update status
        rating.status = status;
        await rating.save();

        // Update product average rating if status changed
        await updateProductAverageRating(rating.productId);

        return res.json({
            success: true,
            message: `Rating ${status} successfully`
        });
    } catch (error) {
        console.error('Error in updateRatingStatus:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating rating status'
        });
    }
};

// Helper function to update product average rating
async function updateProductAverageRating(productId) {
    try {
        const result = await Rating.aggregate([
            { $match: { productId: productId, status: 'approved' } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);

        let avgRating = 0;
        let ratingCount = 0;

        if (result.length > 0) {
            avgRating = Math.round(result[0].averageRating * 10) / 10; // Round to 1 decimal place
            ratingCount = result[0].count;
        }

        await Product.findByIdAndUpdate(productId, {
            averageRating: avgRating,
            ratingCount: ratingCount
        });

    } catch (error) {
        console.error('Error updating product average rating:', error);
    }
}