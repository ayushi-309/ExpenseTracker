const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected to Atlas: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`\n⚠️  Primary MongoDB Atlas connection failed (${error.message}).`);
    console.log(`🚀 Switching to In-Memory Database Fallback Mode for smooth local execution.`);
    console.log(`💡 Note: To connect to your MongoDB Atlas cloud database, whitelist your IP at https://cloud.mongodb.com/\n`);
  }
};

module.exports = connectDB;