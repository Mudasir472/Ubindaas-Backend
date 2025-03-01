const Rating = require('../../models/Rating');
const Product = require('../../models/Product');

// Update product average rating helper function
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

/**
 * List all ratings with filters
 * @route GET /admin/ratings
 * @access Private (Admin)
 */
exports.listRatings = async (req, res) => {
    try {
        const status = req.query.status || 'all';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        // Build query
        let query = {};
        if (status !== 'all') {
            query.status = status;
        }
        
        // Get total count
        const total = await Rating.countDocuments(query);
        
        // Get ratings
        const ratings = await Rating.find(query)
            .populate('userId', 'name email')
            .populate('productId', 'name images slug')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        
        res.render('admin/ratings/list', {
            ratings,
            status,
            limit, // Added the limit variable here
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total,
            title: 'Manage Ratings',
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error('Error in listRatings:', error);
        req.flash('error_msg', 'Error fetching ratings');
        res.redirect('/admin/dashboard');
    }
};

/**
 * Get rating details
 * @route GET /admin/ratings/:id
 * @access Private (Admin)
 */
exports.getRatingDetails = async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('productId');
        
        if (!rating) {
            req.flash('error_msg', 'Rating not found');
            return res.redirect('/admin/ratings');
        }
        
        res.render('admin/ratings/details', {
            rating,
            title: 'Rating Details',
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error('Error in getRatingDetails:', error);
        req.flash('error_msg', 'Error fetching rating details');
        res.redirect('/admin/ratings');
    }
};

/**
 * Update rating status
 * @route PUT /admin/ratings/:id
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
        
        const rating = await Rating.findById(req.params.id);
        
        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }
        
        // Update status
        rating.status = status;
        await rating.save();
        
        // Update product average rating
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

/**
 * Delete rating
 * @route DELETE /admin/ratings/:id
 * @access Private (Admin)
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
        
        const productId = rating.productId;
        
        // Delete rating
        await Rating.findByIdAndDelete(req.params.id);
        
        // Update product average rating
        await updateProductAverageRating(productId);
        
        return res.json({
            success: true,
            message: 'Rating deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteRating:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting rating'
        });
    }
};