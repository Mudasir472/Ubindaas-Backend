// routes/admin/collectionRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const collectionController = require('../../controllers/admin/adminCollectionController');

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/collections');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `collection-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
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