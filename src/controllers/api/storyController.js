const Product = require('../../models/Product');
const Story = require('../../models/Story')
exports.getStories = async (req, res) => {
    try {
        const stories = await Story.find({ isActive: 'true' }).populate('products').sort({ displayOrder: 1 });
        console.log(stories);

        return res.json({
            success: true,
            data: stories
        });
    } catch (error) {
        console.error('Error in stories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stories'
        });
    }
};

// exports.getCategoryProducts = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { page = 1, limit = 12 } = req.query;

//         const products = await Product.find({
//             category: id,
//             status: 'active'
//         })
//             .populate('category')
//             .skip((page - 1) * limit)
//             .limit(limit);

//         const total = await Product.countDocuments({ category: id, status: 'active' });

//         res.json({
//             success: true,
//             data: {
//                 products,
//                 currentPage: page,
//                 totalPages: Math.ceil(total / limit),
//                 total
//             }
//         });
//     } catch (error) {
//         console.error('Error in getCategoryProducts:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching products'
//         });
//     }
// };