const express = require('express');
const router = express.Router();
const productController = require('../../controllers/api/productController');

router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id/related', productController.getRelatedProducts);

module.exports = router;