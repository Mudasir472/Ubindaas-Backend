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

// Make sure create route handles gender parameter
router.get('/create', adminProtect, adminProductController.createProductForm);
router.post('/create', adminProtect, upload.array('images', 5), adminProductController.createProduct);
router.get('/edit/:id', adminProtect, adminProductController.editProductForm);
router.put('/edit/:id', adminProtect, upload.array('images', 5), adminProductController.updateProduct);
router.delete('/:id', adminProtect, adminProductController.deleteProduct);

module.exports = router;