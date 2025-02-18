const Setting = require('../../models/Setting');

exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.findOne().select('-payment.razorpaySecret');
        
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found'
            });
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error in getSettings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching settings'
        });
    }
};

exports.getShippingMethods = async (req, res) => {
    try {
        const settings = await Setting.findOne().select('shipping');
        
        const activeMethods = settings?.shipping?.methods?.filter(method => method.active) || [];

        res.json({
            success: true,
            data: {
                methods: activeMethods,
                freeShippingThreshold: settings?.shipping?.freeShippingThreshold || 0
            }
        });
    } catch (error) {
        console.error('Error in getShippingMethods:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching shipping methods'
        });
    }
};

exports.getSeoSettings = async (req, res) => {
    try {
        const settings = await Setting.findOne().select('seo');

        res.json({
            success: true,
            data: settings?.seo || {}
        });
    } catch (error) {
        console.error('Error in getSeoSettings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching SEO settings'
        });
    }
};

exports.getContactInfo = async (req, res) => {
    try {
        const settings = await Setting.findOne().select('contact storeName socialLinks');

        res.json({
            success: true,
            data: {
                storeName: settings?.storeName,
                contact: settings?.contact,
                socialLinks: settings?.socialLinks
            }
        });
    } catch (error) {
        console.error('Error in getContactInfo:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact information'
        });
    }
};