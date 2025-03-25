// routes/admin/collectionRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const collectionController = require('../../controllers/admin/adminCollectionController');

// Create banners directory if it doesn't exist
const collectionUploadDir = path.join(__dirname, '../../public/uploads/collections');
if (!fs.existsSync(collectionUploadDir)) {
  fs.mkdirSync(collectionUploadDir, { recursive: true });
}

// Configure storage for banner images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, collectionUploadDir);
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

// Routes
router.get('/', collectionController.getAllCollections);
router.get('/create', collectionController.getCreateCollection);
router.post('/create', upload.single('modelImage'), collectionController.createCollection);
router.get('/edit/:id', collectionController.getEditCollection);
router.post('/update/:id', upload.single('modelImage'), collectionController.updateCollection);
router.post('/toggle-status/:id', collectionController.toggleCollectionStatus);
router.post('/delete/:id', collectionController.deleteCollection);

module.exports = router;