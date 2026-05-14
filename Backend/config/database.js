// 🗄️ Database Connection - Simple MongoDB Atlas Setup
const mongoose = require('mongoose');

// Simple function to connect to MongoDB Atlas
const connectDatabase = async () => {
  try {
    // Get connection string from environment variables
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      return; // Don't exit process, let the server start
    }

    // Connect to MongoDB Atlas
    console.log('📡 Attempting to connect to MongoDB Atlas...');
    await mongoose.connect(mongoURI);

    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    console.log('🔍 Check your connection string and network access');
    // Don't exit process
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB Atlas');
});

// Handle app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB Atlas connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDatabase;
