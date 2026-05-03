const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');
const Issue = require('./models/Issue');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Issue.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Hash passwords
    const hashedUserPassword = await bcrypt.hash('user123', 10);
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    // Create a test user
    const user = new User({
      name: 'Test User',
      email: 'user@civic.com',
      password: hashedUserPassword,
      userType: 'user',
      location: {
        address: '123 Main St',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        coordinates: { latitude: 28.6139, longitude: 77.2090 }
      }
    });
    await user.save();
    console.log('👤 Created test user');

    // Create a test admin
    const admin = new User({
      name: 'Admin User',
      email: 'admin@civic.com',
      password: hashedAdminPassword,
      userType: 'admin',
      adminJurisdiction: {
        address: 'Secretariat',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001'
      },
      location: {
        coordinates: { latitude: 28.6139, longitude: 77.2090 },
        serviceRadius: 10
      },
      department: 'road_department'
    });
    await admin.save();
    console.log('👮 Created test admin');

    // Mock image data (tiny transparent 1x1 pixels)
    const mockImage = {
      data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      filename: 'test.png',
      mimetype: 'image/png',
      size: 100
    };

    // Create sample issues
    const issues = [
      {
        title: 'Broken Street Light on MG Road',
        description: 'The street light near the bus stop has been non-functional for over a week.',
        category: 'Infrastructure',
        location: {
          address: 'MG Road, Sector 14, Delhi',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          coordinates: { latitude: 28.6139, longitude: 77.2090 }
        },
        reportedBy: user._id,
        status: 'Open',
        images: [mockImage, mockImage]
      },
      {
        title: 'Garbage Collection Issue',
        description: 'Garbage has not been collected for the past 4 days.',
        category: 'Sanitation',
        location: {
          address: 'Green Park Extension, Delhi',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110016',
          coordinates: { latitude: 28.5588, longitude: 77.2028 }
        },
        reportedBy: user._id,
        status: 'Open',
        images: [mockImage, mockImage]
      }
    ];

    await Issue.insertMany(issues);
    console.log('📍 Created sample issues');

    console.log('✅ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
