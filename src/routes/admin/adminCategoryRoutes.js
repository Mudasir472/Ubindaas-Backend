const express = require('express');
const router = express.Router();
const { adminProtect } = require('../../middlewares/authMiddleware');
const adminCategoryController = require('../../controllers/admin/adminCategoryController');

// Add a test route to verify basic rendering
router.get('/test', adminProtect, (req, res) => {
    res.send('Category route is working');
});

// Main routes
router.get('/', adminProtect, adminCategoryController.listCategories);
router.get('/create', adminProtect, adminCategoryController.createCategoryForm);
router.post('/create', adminProtect, adminCategoryController.createCategory);
router.get('/edit/:id', adminProtect, adminCategoryController.editCategoryForm);
router.put('/edit/:id', adminProtect, adminCategoryController.updateCategory);
router.delete('/:id', adminProtect, adminCategoryController.deleteCategory);

module.exports = router;