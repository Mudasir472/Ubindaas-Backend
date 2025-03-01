const Banner = require('../../models/Banner');

/**
 * Get active banners for frontend
 * @route GET /api/banners
 * @access Public
 */
exports.getActiveBanners = async (req, res) => {
    try {
        const gender = req.query.gender || 'all';
        
        // Get banners that are active and either for all genders or the specified gender
        const banners = await Banner.find({
            status: 'active',
            $or: [{ forGender: 'all' }, { forGender: gender }]
        }).sort({ position: 1 }).limit(5); // Limit to 5 banners for carousel
        
        res.json({
            success: true,
            data: banners
        });
    } catch (error) {
        console.error('Error in getActiveBanners:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching banners'
        });
    }
};

/**
 * Get banner by ID
 * @route GET /api/banners/:id
 * @access Public
 */
exports.getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        
        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }
        
        res.json({
            success: true,
            data: banner
        });
    } catch (error) {
        console.error('Error in getBannerById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching banner'
        });
    }
};