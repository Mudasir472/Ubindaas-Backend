const { log } = require('console');
// const Banner = require('../../models/Banner');
const fs = require('fs').promises;
const path = require('path');

const OfferBanner = require('../../models/OfferBanner')

// Helper function to delete a banner image
const deleteBannerImage = async (filename) => {
    try {
        const imagePath = path.join(__dirname, '../../public/uploads/offerbanners', filename);
        await fs.unlink(imagePath);
    } catch (error) {
        console.error('Error deleting banner image:', error);
    }
};

// Admin controllers
exports.listOfferBanners = async (req, res) => {
    try {
        const offerBanners = await OfferBanner.find().sort({ position: 1 });

        res.render('admin/offerBanners/list', {
            offerBanners,
            title: 'Manage Banners',
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error('Error in listBanners:', error);
        req.flash('error_msg', 'Error fetching banners');
        res.redirect('/admin/dashboard');
    }
};

exports.createOfferBannerForm = async (req, res) => {
    res.render('admin/offerBanners/create', {
        title: 'Create Banner',
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
    });
};

exports.createOfferBanner = async (req, res) => {
    try {
        const { title, link, status } = req.body;

        // Handle image
        if (!req.file) {
            req.flash('error_msg', 'Banner image is required');
            return res.redirect('/admin/offerBanners/create');
        }

        const image = req.file.filename;
        if (status === "active") {
            // Get all active banners sorted by creation date (oldest first)
            const activeBanners = await OfferBanner.find({ status: "active" })
                .sort({ createdAt: 1 }); // Sort by creation date (oldest first)

            // If we already have 2 active banners, deactivate the oldest one
            if (activeBanners.length >= 2) {
                await OfferBanner.updateOne(
                    { _id: activeBanners[0]._id }, // The oldest banner
                    { $set: { status: "inactive" } }
                );
            }
        }
        // Create banner
        await OfferBanner.create({
            title,
            image,
            status,
        });


        req.flash('success_msg', 'Banner created successfully');
        res.redirect('/admin/offerBanners');
    } catch (error) {
        console.error('Error in createBanner:', error);

        // Clean up uploaded file if there was an error
        if (req.file) {
            await deleteBannerImage(req.file.filename);
        }

        req.flash('error_msg', 'Error creating banner: ' + error.message);
        res.redirect('/admin/offerBanners/create');
    }
};

exports.editOfferBannerForm = async (req, res) => {
    try {
        const offerBanner = await OfferBanner.findById(req.params.id);

        if (!offerBanner) {
            req.flash('error_msg', 'Banner not found');
            return res.redirect('/admin/offerBanners');
        }

        res.render('admin/offerBanners/edit', {
            offerBanner,
            title: 'Edit Banner',
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error('Error in editBannerForm:', error);
        req.flash('error_msg', 'Error loading banner');
        res.redirect('/admin/offerBanners');
    }
};

exports.updateOfferBanner = async (req, res) => {
    try {
        const { title, link, status, } = req.body;
        const banner = await OfferBanner.findById(req.params.id);

        if (!banner) {
            req.flash('error_msg', 'Banner not found');
            return res.redirect('/admin/offerBanners');
        }

        // Handle image
        let image = banner.image;

        if (req.file) {
            // Delete old image
            await deleteBannerImage(banner.image);
            image = req.file.filename;
        }
        if (status === "active") {
            // Get all active banners (excluding the current one we're updating)
            const activeBanners = await OfferBanner.find({
                status: "active",
                _id: { $ne: req.params.id } // Exclude current banner
            }).sort({ createdAt: 1 }); // Sort by creation date (oldest first)

            // If we already have 2 active banners (excluding current one), deactivate the oldest
            if (activeBanners.length >= 2) {
                await OfferBanner.updateOne(
                    { _id: activeBanners[0]._id }, // The oldest banner
                    { $set: { status: "inactive" } }
                );
            }
        }

        // Update banner
        await OfferBanner.findByIdAndUpdate(req.params.id, {
            title,
            image,
            link,
            status,
        });

        req.flash('success_msg', 'Banner updated successfully');
        res.redirect('/admin/offerBanners');
    } catch (error) {
        console.error('Error in updateBanner:', error);
        req.flash('error_msg', 'Error updating banner: ' + error.message);
        res.redirect(`/admin/offerBanners/edit/${req.params.id}`);
    }
};

exports.deleteOfferBanner = async (req, res) => {
    try {
        const banner = await OfferBanner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        // Delete image
        await deleteBannerImage(banner.image);

        // Delete banner
        await OfferBanner.findByIdAndDelete(req.params.id);

        return res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error in deleteBanner:', error);
        return res.status(500).json({ success: false, message: 'Error deleting banner' });
    }
};

// API controllers for frontend
exports.getActiveBanners = async (req, res) => {
    try {

        // Get banners that are active and either for all genders or the specified gender
        const banners = await OfferBanner.find({
            status: 'active',
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