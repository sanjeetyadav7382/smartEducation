const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartEduDB';
        await mongoose.connect(uri);
        console.log(`MongoDB Connected 🚀`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.warn(`Make sure MongoDB Compass / Server is running locally.`);
    }
};

module.exports = connectDB;
