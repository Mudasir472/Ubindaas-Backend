// controllers/admin/collectionController.js
const Collection = require('../../models/Collection');
const Product = require('../../models/Product');
const fs = require('fs');
const path = require('path');

// Display list of all Collections
exports.getAllCollections = async (req, res) => {
  try {
    const collections = await Collection.find().populate('products').sort({ displayOrder: 1 });
    
    res.render('admin/collections/list', {
      collections,
      title: 'Manage Collections'
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.redirect('/admin/dashboard');
  }
};

// Display collection create form
exports.getCreateCollection = async (req, res) => {
  try {
    // Fetch all active products
    const products = await Product.find({ status: 'active' })
                                  .select('_id name price gender category')
                                  .sort({ name: 1 });
    
    res.render('admin/collections/create', {
      title: 'Create New Collection',
      products,
      collection: {
        name: '',
        description: '',
        isActive: true,
        displayOrder: 0,
        products: []
      }
    });
  } catch (error) {
    console.error('Error preparing collection form:', error);
    res.redirect('/admin/collections');
  }
};

// Handle collection create POST
exports.createCollection = async (req, res) => {
  try {
    const { name, description, isActive, displayOrder } = req.body;
    
    // Handle product selection (multiple select returns array or single value)
    let selectedProducts = req.body.products || [];
    if (!Array.isArray(selectedProducts)) {
      selectedProducts = [selectedProducts];
    }
    
    // Create new collection object
    const newCollection = new Collection({
      name,
      description,
      isActive: isActive === 'true' || isActive === 'on',
      displayOrder: displayOrder || 0,
      products: selectedProducts
    });
    
    // Handle model image upload
    if (req.file) {
      newCollection.modelImageUrl = `/uploads/collections/${req.file.filename}`;
    }
    
    await newCollection.save();
    
    res.redirect('/admin/collections');
  } catch (error) {
    console.error('Error creating collection:', error);
    res.redirect('/admin/collections/create');
  }
};

// Display collection edit form
exports.getEditCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.redirect('/admin/collections');
    }
    
    // Fetch all active products
    const products = await Product.find({ status: 'active' })
                                 .select('_id name price gender category')
                                 .sort({ name: 1 });
    
    res.render('admin/collections/edit', {
      title: 'Edit Collection',
      collection,
      products,
      editMode: true
    });
  } catch (error) {
    console.error('Error preparing edit form:', error);
    res.redirect('/admin/collections');
  }
};

// Handle collection update POST
exports.updateCollection = async (req, res) => {
  try {
    const { name, description, isActive, displayOrder } = req.body;
    
    // Handle product selection (multiple select returns array or single value)
    let selectedProducts = req.body.products || [];
    if (!Array.isArray(selectedProducts)) {
      selectedProducts = [selectedProducts];
    }
    
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.redirect('/admin/collections');
    }
    
    // Update collection fields
    collection.name = name;
    collection.description = description;
    collection.isActive = isActive === 'true' || isActive === 'on';
    collection.displayOrder = displayOrder || 0;
    collection.products = selectedProducts;
    
    // Handle model image upload
    if (req.file) {
      // Delete previous image if exists
      if (collection.modelImageUrl) {
        const oldImagePath = path.join(__dirname, '../..', 'public', collection.modelImageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      collection.modelImageUrl = `/uploads/collections/${req.file.filename}`;
    }
    
    await collection.save();
    
    res.redirect('/admin/collections');
  } catch (error) {
    console.error('Error updating collection:', error);
    res.redirect(`/admin/collections/edit/${req.params.id}`);
  }
};

// Toggle collection active status
exports.toggleCollectionStatus = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.redirect('/admin/collections');
    }
    
    // Toggle active status
    collection.isActive = !collection.isActive;
    await collection.save();
    
    res.redirect('/admin/collections');
  } catch (error) {
    console.error('Error toggling collection status:', error);
    res.redirect('/admin/collections');
  }
};

// Delete collection
exports.deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.redirect('/admin/collections');
    }
    
    // Delete model image file if exists
    if (collection.modelImageUrl) {
      const imagePath = path.join(__dirname, '../..', 'public', collection.modelImageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Collection.findByIdAndDelete(req.params.id);
    
    res.redirect('/admin/collections');
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.redirect('/admin/collections');
  }
};