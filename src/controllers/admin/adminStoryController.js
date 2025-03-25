// controllers/admin/collectionController.js
const { log } = require('console');
// const Collection = require('../../models/Collection');
const Product = require('../../models/Product');
const fs = require('fs');
const path = require('path');

const Story = require("../../models/Story")

// Helper function to delete file
const deleteFile = async (filename, isVideo = false) => {
    try {
        const directory = isVideo ? 'videos' : 'products';
        const filePath = path.join(__dirname, `../../public/uploads/${directory}`, filename);
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

// Display list of all stories
exports.getAllStories = async (req, res) => {
    try {
        const stories = await Story.find().populate('products').sort({ displayOrder: 1 });
        console.log(stories);

        res.render('admin/stories/list', {
            stories,
            title: 'Manage Stories'
        });
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.redirect('/admin/dashboard')
    }
};

// Display stories create form
exports.getCreateStory = async (req, res) => {
    try {
        // Fetch all active products
        const products = await Product.find({ status: 'active' })
            .select('_id name price gender category')
            .sort({ name: 1 });

        res.render('admin/stories/create', {
            title: 'Create New Story',
            products,
            story: {
                isActive: true,
                products: []
            }
        });
    } catch (error) {
        console.error('Error preparing stories form:', error);
        res.redirect('/admin/stories');
    }
};

// Handle stories create POST
exports.createStory = async (req, res) => {
    try {
        const { isActive } = req.body;
        // Handle product selection
        let selectedProducts = req.body.products
        // Handle videos and images
        const image = req.files && req.files.image ? req.files.image[0].filename : null;
        const video = req.files && req.files.video ? req.files.video[0].filename : null;

        // Create new story object
        const newStory = new Story({
            isActive: isActive === 'true' || isActive === 'on',
            products: selectedProducts,
            image,
            video
        });
        await newStory.save();

        res.redirect('/admin/stories');
    } catch (error) {
        console.error('Error in create story:', error);

        // Clean up uploaded files in case of error
        if (req.files) {
            if (req.files.image) {
                await deleteFile(req.files.image[0].filename);
            }
            if (req.files.video) {
                await deleteFile(req.files.video[0].filename, true);
            }
        }
        req.flash('error_msg', 'Error creating story: ' + error.message);
        res.redirect('/admin/stories/create');
    }
};

// Display story edit form
exports.getEditStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.redirect('/admin/stories');
        }

        // Fetch all active products
        const products = await Product.find({ status: 'active' })
            .select('_id name price gender category')
            .sort({ name: 1 });

        res.render('admin/stories/edit', {
            title: 'Edit story',
            story,
            products,
            editMode: true
        });
    } catch (error) {
        console.error('Error preparing edit form:', error);
        res.redirect('/admin/stories');
    }
};

// Handle story update POST
exports.updateStory = async (req, res) => {
    try {
        const { isActive } = req.body;

        // Handle product selection
        let selectedProducts = req.body.products;


        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.redirect('/admin/stories');
        }

        // Update Story fields
        story.isActive = isActive === 'true' || isActive === 'on';
        story.products = selectedProducts;
        // Handle model image upload


        if (req.files) {
            // Delete previous image if exists
            if (story.image) {
                const oldImagePath = path.join(__dirname, '../..', 'public/uploads/products', story.image);
                console.log(oldImagePath);
                if (story.image) {
                    deleteFile(story.image)
                }
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            story.image = `${req.files.image[0].filename}`;
            if (story.video) {
                const oldVideoPath = path.join(__dirname, '../..', 'public/uploads/videos', story.video);
                console.log(oldVideoPath);

                if (fs.existsSync(oldVideoPath)) {
                    fs.unlinkSync(oldVideoPath);
                }
            }
            story.video = `${req.files.video[0].filename}`;
        }

        await story.save();


        res.redirect('/admin/stories');
    } catch (error) {
        console.error('Error updating story:', error);
        res.redirect(`/admin/stories/edit/${req.params.id}`);
    }
};

// // Toggle collection active status
exports.toggleStoryStatus = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) {
            return res.redirect('/admin/stories');
        }
        // Toggle active status
        story.isActive = !story.isActive;
        await story.save();
        res.redirect('/admin/stories');
    } catch (error) {
        console.error('Error toggling story status:', error);
        res.redirect('/admin/stories');
    }
};

// Delete collection
exports.deleteStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.redirect('/admin/stories');
        }

        // Delete model image file if exists
        // Delete previous image if exists
        if (story.image) {
            const oldImagePath = path.join(__dirname, '../..', 'public/uploads/products', story.image);
            console.log(oldImagePath);

            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        if (story.video) {
            const oldVideoPath = path.join(__dirname, '../..', 'public/uploads/videos', story.video);
            console.log(oldVideoPath);

            if (fs.existsSync(oldVideoPath)) {
                fs.unlinkSync(oldVideoPath);
            }
        }

        // if (story.image) {
        //     const imagePath = path.join(__dirname, '../..', 'public', story.image);
        //     if (fs.existsSync(imagePath)) {
        //         fs.unlinkSync(imagePath);
        //     }
        // }

        await Story.findByIdAndDelete(req.params.id);
        res.redirect('/admin/stories');
    } catch (error) {
        console.error('Error deleting story:', error);
        res.redirect('/admin/stories');
    }
};