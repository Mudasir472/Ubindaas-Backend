const Rating = require('../../models/Rating');
const Product = require('../../models/Product');
const mongoose = require('mongoose');

/**
 * Add or update a product rating
 * @route POST /api/ratings
 * @access Private
 */

exports.addRating = async (req, res) => {
    try {
        const productId = req.params.productId;
        const { rating, review } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const existingRating = await Rating.findOne({ productId, userId });

        if (existingRating) {
            // Update existing rating
            existingRating.rating = rating;
            existingRating.review = review;
            existingRating.status = 'pending'; // Reset status if needed
            await existingRating.save();

            return res.status(200).json({
                success: true,
                data: existingRating,
                message: "Your rating has been updated and is pending approval",
            });
        } else {
            // Create new rating
            const newRating = await Rating.create({
                productId,
                userId,
                rating,
                review,
                status: "pending",
            });

            res.status(201).json({
                success: true,
                data: newRating,
                message: "Your rating has been submitted and is pending approval",
            });
        }

        // Update product average rating in the background
        updateProductAverageRating(productId);
    } catch (error) {
        console.error("Error in addRating:", error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You have already rated this product",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error adding rating",
        });
    }
};


/**
 * Get approved ratings for a product
 * @route GET /api/ratings/product/:productId
 * @access Public
 */
exports.getProductRatings = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log(req.params);

        // Validate that productId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const ratings = await Rating.find({
            productId,
            status: 'approved'
        })
            .populate('userId', 'name avatar') // Get user info without sensitive data
            .sort({ createdAt: -1 });
        console.log(ratings);

        res.json({
            success: true,
            data: ratings
        });
    } catch (error) {
        console.error('Error in getProductRatings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ratings'
        });
    }
};

/**
 * Get average rating and count for a product
 * @route GET /api/ratings/average/:productId
 * @access Public
 */
exports.getAverageRating = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate that productId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const result = await Rating.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'approved' } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    count: { $sum: 1 },
                    ratings: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        if (result.length === 0) {
            return res.json({
                success: true,
                data: {
                    averageRating: 0,
                    count: 0,
                    distribution: {
                        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
                    }
                }
            });
        }

        // Calculate distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        result[0].ratings.forEach(r => {
            distribution[r] = (distribution[r] || 0) + 1;
        });

        res.json({
            success: true,
            data: {
                averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal place
                count: result[0].count,
                distribution
            }
        });
    } catch (error) {
        console.error('Error in getAverageRating:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating average rating'
        });
    }
};

/**
 * Delete a rating (only by the user who created it)
 * @route DELETE /api/ratings/:id
 * @access Private
 */
exports.deleteRating = async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id);

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        // Check if the user is the owner of the rating
        if (rating.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this rating'
            });
        }

        await Rating.findByIdAndDelete(req.params.id);

        // Update product average rating in the background
        updateProductAverageRating(rating.productId);

        res.json({
            success: true,
            message: 'Rating deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteRating:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting rating'
        });
    }
};

// Admin controller methods

/**
 * Get all ratings (admin only)
 * @route GET /api/admin/ratings
 * @access Private (Admin)
 */
exports.getAllRatings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || 'pending';

        const filter = {};
        if (status !== 'all') {
            filter.status = status;
        }

        const total = await Rating.countDocuments(filter);

        const ratings = await Rating.find(filter)
            .populate('userId', 'name email')
            .populate('productId', 'name images')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            success: true,
            data: {
                ratings,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Error in getAllRatings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ratings'
        });
    }
};

/**
 * Update rating status (admin only)
 * @route PUT /api/admin/ratings/:id
 * @access Private (Admin)
 */
exports.updateRatingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const rating = await Rating.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        // Update product average rating in the background
        updateProductAverageRating(rating.productId);
        res.json({
            success: true,
            data: rating,
            message: `Rating ${status} successfully`
        });
    } catch (error) {
        console.error('Error in updateRatingStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating rating status'
        });
    }
};

exports.getRatings = async (req, res) => {
    try {
        const allRatings = await Rating.find({}).populate('userId');

        res.status(200).json({
            success: true,
            ratings: allRatings
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}

/**
 * Helper function to update product's average rating
 */
async function updateProductAverageRating(productId) {
    try {
        const result = await Rating.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'approved' } },
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