const express = require('express');
const router = express.Router();
const productController = require('../../controllers/api/productController');

// Define all routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/search', productController.searchProducts);

router.get('/category', productController.getAllProductsCategory);

router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);
router.get('/:id/related', productController.getRelatedProducts);
router.get('/featured', productController.getFeaturedProducts);

module.exports = router;