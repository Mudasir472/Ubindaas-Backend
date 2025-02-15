const express = require('express');
const router = express.Router();
const { adminProtect } = require('../../middlewares/authMiddleware');
const productController = require('../../controllers/admin/adminProductController');
const upload = require('../../middlewares/uploadMiddleware');

// Configure multer for multiple images
const multipleUpload = upload.array('images', 5); // Max 5 images

router.get('/', adminProtect, productController.listProducts);
router.get('/create', adminProtect, productController.createProductForm);
router.post('/create', adminProtect, multipleUpload, productController.createProduct);
router.get('/edit/:id', adminProtect, productController.editProductForm);
router.put('/edit/:id', adminProtect, multipleUpload, productController.updateProduct);

module.exports = router;