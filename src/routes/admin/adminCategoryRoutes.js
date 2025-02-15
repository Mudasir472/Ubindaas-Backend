const express = require('express');
const router = express.Router();
const { adminProtect } = require('../../middlewares/authMiddleware');
const categoryController = require('../../controllers/admin/adminCategoryController');
const upload = require('../../middlewares/uploadMiddleware');

// Super Category Routes
router.get('/super', adminProtect, categoryController.listSuperCategories);
router.get('/super/create', adminProtect, categoryController.createSuperCategoryForm);
router.post('/super/create', adminProtect, upload.single('image'), categoryController.createSuperCategory);
router.get('/super/edit/:id', adminProtect, categoryController.editSuperCategoryForm);
router.put('/super/edit/:id', adminProtect, upload.single('image'), categoryController.updateSuperCategory);
router.delete('/super/:id', adminProtect, categoryController.deleteSuperCategory);

module.exports = router;