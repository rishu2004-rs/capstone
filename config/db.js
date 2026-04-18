const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            family: 4, // Force IPv4 to resolve SRV ECONNREFUSED issues
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.log('--- Troubleshooting Tip ---');
        console.log('1. Check if your current IP is whitelisted in MongoDB Atlas (Network Access).');
        console.log('2. Try changing your computer DNS to 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare).');
        console.log('3. Ensure your internet connection is stable or try a different network/mobile hotspot.');
        // Don't exit process, let the server stay up for other routes or debugging
    }
};

module.exports = connectDB;

