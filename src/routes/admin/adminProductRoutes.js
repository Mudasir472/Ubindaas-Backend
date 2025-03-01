const express = require('express');
const router = express.Router();
const { adminProtect } = require('../../middlewares/authMiddleware');
const adminProductController = require('../../controllers/admin/adminProductController');
const upload = require('../../middlewares/uploadMiddleware');

// Redirect base product route to men's products if no gender specified
router.get('/', adminProtect, (req, res) => {
    if (!req.query.gender) {
        return res.redirect('/admin/products?gender=men');
    }
    adminProductController.listProducts(req, res);
});

// Configure upload fields for both images and video
const uploadFields = upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 }
]);

// Define routes with updated upload middleware
router.get('/create', adminProtect, adminProductController.createProductForm);
router.post('/create', adminProtect, uploadFields, adminProductController.createProduct);
router.get('/edit/:id', adminProtect, adminProductController.editProductForm);
router.put('/edit/:id', adminProtect, uploadFields, adminProductController.updateProduct);
router.delete('/:id', adminProtect, adminProductController.deleteProduct);
router.delete('/:id/image/:filename', adminProtect, adminProductController.deleteProductImage);

// Only include this route if the method is implemented in your controller
// router.delete('/:id/video', adminProtect, adminProductController.deleteProductVideo);

module.exports = router;