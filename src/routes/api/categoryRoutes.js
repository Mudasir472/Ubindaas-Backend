const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/api/categoryController');

router.get('/', categoryController.getCategories);
router.get('/:gender', categoryController.getCategoriesByGender);
router.get('/:id/products', categoryController.getCategoryProducts);

module.exports = router;