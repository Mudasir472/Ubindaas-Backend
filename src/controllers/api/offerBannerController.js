const OfferBanner = require('../../models/OfferBanner')
exports.getActiveBanners = async (req, res) => {
    try {
        // Get banners that are active
        const banners = await OfferBanner.find({
            status: 'active',
        }).sort({ position: 1 })

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