const Setting = require('../../models/Setting');
const fs = require('fs').promises;
const path = require('path');

exports.getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        
        // Create default settings if none exist
        if (!settings) {
            settings = await Setting.create({
                storeName: 'Ubindass',
                contact: {
                    email: 'contact@ubindass.com',
                    phone: '+91 1234567890'
                },
                payment: {
                    methods: [
                        { name: 'cod', active: true },
                        { name: 'online', active: false }
                    ]
                }
            });
        }

        res.render('admin/settings/index', {
            title: 'Store Settings',
            settings
        });
    } catch (error) {
        console.error('Error in getSettings:', error);
        req.flash('error_msg', 'Error loading settings');
        res.redirect('/admin/dashboard');
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const {
            storeName,
            email,
            phone,
            address,
            socialLinks,
            paymentMethods,
            shippingMethods,
            emailSettings,
            seo
        } = req.body;

        let settings = await Setting.findOne();
        if (!settings) {
            settings = new Setting();
        }

        // Update settings
        settings.storeName = storeName;
        settings.contact.email = email;
        settings.contact.phone = phone;
        settings.contact.address = address;
        settings.socialLinks = socialLinks;

        // Handle logo upload
        if (req.file) {
            // Delete old logo if exists
            if (settings.logo) {
                try {
                    await fs.unlink(path.join(__dirname, '../../public/uploads/', settings.logo));
                } catch (err) {
                    console.error('Error deleting old logo:', err);
                }
            }
            settings.logo = req.file.filename;
        }

        // Update payment methods
        settings.payment.methods = JSON.parse(paymentMethods);
        
        // Update shipping methods
        settings.shipping.methods = JSON.parse(shippingMethods);

        // Update email settings
        if (emailSettings) {
            settings.emailSettings = JSON.parse(emailSettings);
        }

        // Update SEO settings
        if (seo) {
            settings.seo = JSON.parse(seo);
        }

        await settings.save();

        req.flash('success_msg', 'Settings updated successfully');
        res.redirect('/admin/settings');
    } catch (error) {
        console.error('Error in updateSettings:', error);
        req.flash('error_msg', 'Error updating settings');
        res.redirect('/admin/settings');
    }
};

exports.updatePaymentSettings = async (req, res) => {
    try {
        const { razorpayKey, razorpaySecret } = req.body;

        let settings = await Setting.findOne();
        if (!settings) {
            settings = new Setting();
        }

        settings.payment.razorpayKey = razorpayKey;
        settings.payment.razorpaySecret = razorpaySecret;

        await settings.save();

        res.json({ success: true, message: 'Payment settings updated successfully' });
    } catch (error) {
        console.error('Error in updatePaymentSettings:', error);
        res.status(500).json({ success: false, message: 'Error updating payment settings' });
    }
};