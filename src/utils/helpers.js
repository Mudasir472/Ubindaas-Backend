const fs = require('fs').promises;
const path = require('path');

exports.deleteFile = async (filename) => {
    try {
        const filePath = path.join(__dirname, '../public/uploads/products', filename);
        await fs.unlink(filePath);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};