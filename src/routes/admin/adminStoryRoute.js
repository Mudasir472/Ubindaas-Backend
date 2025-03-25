// routes/admin/collectionRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const collectionController = require('../../controllers/admin/adminCollectionController');

const storyController = require("../../controllers/admin/adminStoryController");
const upload = require('../../middlewares/uploadMiddleware');

// // Create banners directory if it doesn't exist
// const collectionUploadDir = path.join(__dirname, '../../public/uploads/stories');
// if (!fs.existsSync(collectionUploadDir)) {
//     fs.mkdirSync(collectionUploadDir, { recursive: true });
// }

// // Configure storage for banner images
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, collectionUploadDir);
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// // File filter
// const fileFilter = (req, file, cb) => {
//     // Accept images only
//     if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|webp|WEBP)$/)) {
//         req.fileValidationError = 'Only image files are allowed!';
//         return cb(new Error('Only image files are allowed!'), false);
//     }
//     cb(null, true);
// };

// // Initialize upload middleware
// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: 5 * 1024 * 1024 // 5MB max size
//     }
// });

// Configure upload fields for both images and video
const uploadFields = upload.fields([
    { name: 'image', maxCount: 5 },
    { name: 'video', maxCount: 1 }
]);

// Routes
router.get('/', storyController.getAllStories);
router.get('/create', storyController.getCreateStory);
router.post('/create', uploadFields, storyController.createStory);
router.get('/edit/:id', storyController.getEditStory);
router.post('/update/:id', uploadFields, storyController.updateStory);
router.post('/toggle-status/:id', storyController.toggleStoryStatus);
router.post('/delete/:id', storyController.deleteStory);

module.exports = router;