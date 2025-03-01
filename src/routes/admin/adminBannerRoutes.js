// Admin routes for banner management
const express = require('express');
const router = express.Router();
const { adminProtect } = require('../../middlewares/authMiddleware');
const bannerController = require('../../controllers/admin/BannerController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create banners directory if it doesn't exist
const bannerUploadDir = path.join(__dirname, '../../public/uploads/banners');
if (!fs.existsSync(bannerUploadDir)) {
    fs.mkdirSync(bannerUploadDir, { recursive: true });
}

// Configure storage for banner images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, bannerUploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|webp|WEBP)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Initialize upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max size
    }
});

// Banner routes
router.get('/', adminProtect, bannerController.listBanners);
router.get('/create', adminProtect, bannerController.createBannerForm);
router.post('/create', adminProtect, upload.single('image'), bannerController.createBanner);
router.get('/edit/:id', adminProtect, bannerController.editBannerForm);
router.put('/edit/:id', adminProtect, upload.single('image'), bannerController.updateBanner);
router.delete('/:id', adminProtect, bannerController.deleteBanner);

module.exports = router;