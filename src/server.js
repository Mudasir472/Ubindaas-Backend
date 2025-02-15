const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Add this to your server.js or create a separate seed file
const User = require('./models/User');

const createAdminUser = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@ubindass.com' });
        if (!adminExists) {
            await User.create({
                name: 'Admin',
                email: 'admin@ubindass.com',
                password: 'admin123', // Change this in production
                role: 'admin',
                status: 'active'
            });
            console.log('Admin user created successfully');
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

// Call this after database connection
createAdminUser();