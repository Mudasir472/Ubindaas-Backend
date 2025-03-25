const express = require('express');
const router = express.Router();
const storyController = require("../../controllers/api/storyController")

router.get('/', storyController.getStories);
// router.get('/:id/products', categoryController.getCategoryProducts);

module.exports = router;