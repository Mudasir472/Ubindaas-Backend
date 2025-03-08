const { log } = require('console');
const Banner = require('../../models/Banner');
const fs = require('fs').promises;
const path = require('path');

// Helper function to delete a banner image
const deleteBannerImage = async (filename) => {
    try {
        const imagePath = path.join(__dirname, '../../public/uploads/banners', filename);
        await fs.unlink(imagePath);
    } catch (error) {
        console.error('Error deleting banner image:', error);
    }
};

// Admin controllers
exports.listBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ position: 1 });

        res.render('admin/banners/list', {
            banners,
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

exports.createBannerForm = async (req, res) => {
    res.render('admin/banners/create', {
        title: 'Create Banner',
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
    });
};

exports.createBanner = async (req, res) => {
    try {
        const { title, subtitle, link, buttonText, position, status, forGender, bannerFor } = req.body;
        // Handle image
        if (!req.file) {
            req.flash('error_msg', 'Banner image is required');
            return res.redirect('/admin/banners/create');
        }

        const image = req.file.filename;
        if (status === "active" && bannerFor === "offer") {
            await Banner.updateMany(
                { bannerFor: "offer", status: "active" },
                { $set: { status: "inactive" } }
            );
        }
        // Create banner
        await Banner.create({
            title,
            subtitle,
            image,
            link,
            buttonText: buttonText || 'Shop Now',
            position: parseInt(position) || 0,
            status,
            bannerFor,
            forGender
        });

        req.flash('success_msg', 'Banner created successfully');
        res.redirect('/admin/banners');
    } catch (error) {
        console.error('Error in createBanner:', error);

        // Clean up uploaded file if there was an error
        if (req.file) {
            await deleteBannerImage(req.file.filename);
        }

        req.flash('error_msg', 'Error creating banner: ' + error.message);
        res.redirect('/admin/banners/create');
    }
};

exports.editBannerForm = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            req.flash('error_msg', 'Banner not found');
            return res.redirect('/admin/banners');
        }

        res.render('admin/banners/edit', {
            banner,
            title: 'Edit Banner',
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    } catch (error) {
        console.error('Error in editBannerForm:', error);
        req.flash('error_msg', 'Error loading banner');
        res.redirect('/admin/banners');
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const { title, subtitle, link, buttonText, position, status, forGender, bannerFor } = req.body;

        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            req.flash('error_msg', 'Banner not found');
            return res.redirect('/admin/banners');
        }

        // Handle image
        let image = banner.image;

        if (req.file) {
            // Delete old image
            await deleteBannerImage(banner.image);
            image = req.file.filename;
        }
        if (status === "active" && bannerFor === "offer") {
            await Banner.updateMany(
                { bannerFor: "offer", status: "active" },
                { $set: { status: "inactive" } }
            );
        }

        // Update banner
        await Banner.findByIdAndUpdate(req.params.id, {
            title,
            subtitle,
            image,
            link,
            buttonText: buttonText || 'Shop Now',
            position: parseInt(position) || 0,
            status,
            forGender,
            bannerFor
        });

        req.flash('success_msg', 'Banner updated successfully');
        res.redirect('/admin/banners');
    } catch (error) {
        console.error('Error in updateBanner:', error);
        req.flash('error_msg', 'Error updating banner: ' + error.message);
        res.redirect(`/admin/banners/edit/${req.params.id}`);
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        // Delete image
        await deleteBannerImage(banner.image);

        // Delete banner
        await Banner.findByIdAndDelete(req.params.id);

        return res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error in deleteBanner:', error);
        return res.status(500).json({ success: false, message: 'Error deleting banner' });
    }
};

// API controllers for frontend
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