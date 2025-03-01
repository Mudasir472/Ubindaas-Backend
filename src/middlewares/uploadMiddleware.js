const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create directories if they don't exist
const imageUploadDir = path.join(__dirname, '../public/uploads/products');
const videoUploadDir = path.join(__dirname, '../public/uploads/videos');

// Create directories if they don't exist
if (!fs.existsSync(imageUploadDir)) {
    fs.mkdirSync(imageUploadDir, { recursive: true });
}
if (!fs.existsSync(videoUploadDir)) {
    fs.mkdirSync(videoUploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Choose destination based on file type (video or image)
        if (file.fieldname === 'video') {
            cb(null, videoUploadDir);
        } else {
            cb(null, imageUploadDir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'video') {
        // Accept videos only for video field
        if (!file.originalname.match(/\.(mp4|MP4|mov|MOV|avi|AVI|webm|WEBM|mkv|MKV)$/)) {
            req.fileValidationError = 'Only video files are allowed for video upload!';
            return cb(new Error('Only video files are allowed for video upload!'), false);
        }
    } else {
        // Accept images only for other fields (assuming they're image uploads)
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP)$/)) {
            req.fileValidationError = 'Only image files are allowed!';
            return cb(new Error('Only image files are allowed!'), false);
        }
    }
    cb(null, true);
};

// Set up multer with different configurations for images and video
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: file => {
            if (file.fieldname === 'video') {
                return 50 * 1024 * 1024; // 50MB limit for videos
            }
            return 5 * 1024 * 1024; // 5MB limit for images
        }
    }
});

module.exports = upload;