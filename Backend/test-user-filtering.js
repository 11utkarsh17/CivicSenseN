// Test script to verify user location-based filtering
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Issue = require('./models/Issue');

// Haversine formula to calculate distance between coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Filter function (copied from routes/issues.js)
const filterIssuesByUserLocation = (issues, userLocation) => {
  if (!userLocation) {
    console.log('⚠️ User has no location data - showing all issues');
    return issues;
  }

  const { city, state, pincode, coordinates, serviceRadius = 5 } = userLocation;
  console.log(`🔍 Filtering issues for user location: ${city}, ${state} (serviceRadius: ${serviceRadius}km)`);
  
  return issues.filter(issue => {
    if (!issue.location) {
      console.log(`❌ Excluding "${issue.title}" - No location data`);
      return false;
    }
    
    // Priority 1: Exact city and state match
    if (issue.location.city && issue.location.state && city && state) {
      if (issue.location.city.toLowerCase() === city.toLowerCase() && 
          issue.location.state.toLowerCase() === state.toLowerCase()) {
        console.log(`✅ Including "${issue.title}" - City/State match`);
        return true;
      }
    }
    
    // Priority 2: Distance-based filtering (if both have coordinates)
    if (coordinates?.latitude && coordinates?.longitude && 
        issue.location.coordinates?.latitude && issue.location.coordinates?.longitude) {
      const distance = calculateDistance(
        coordinates.latitude, coordinates.longitude,
        issue.location.coordinates.latitude, issue.location.coordinates.longitude
      );
      
      if (distance <= serviceRadius) {
        console.log(`✅ Including "${issue.title}" - Distance match (${distance.toFixed(2)}km)`);
        return true;
      } else {
        console.log(`❌ Excluding "${issue.title}" - Too far (${distance.toFixed(2)}km > ${serviceRadius}km)`);
        return false;
      }
    }
    
    // Priority 3: Pincode match (fallback)
    if (issue.location.pincode && pincode) {
      if (issue.location.pincode === pincode) {
        console.log(`✅ Including "${issue.title}" - Pincode match`);
        return true;
      }
    }
    
    console.log(`❌ Excluding "${issue.title}" - No matching criteria`);
    return false;
  });
};

async function testUserFiltering() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all regular users
    console.log('\n👥 Fetching regular users...');
    const users = await User.find({ userType: 'user' });
    console.log(`Found ${users.length} regular users`);

    // Get all issues
    console.log('\n📋 Fetching all issues...');
    const issues = await Issue.find({});
    console.log(`Found ${issues.length} total issues`);

    // Test filtering for each user
    console.log('\n🧪 Testing filtering for each user:');
    console.log('='.repeat(60));
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.name} (${user.email})`);
      console.log(`📍 Location: ${user.location?.city}, ${user.location?.state}, ${user.location?.pincode}`);
      console.log(`🎯 Coordinates: ${user.location?.coordinates?.latitude}, ${user.location?.coordinates?.longitude}`);
      console.log(`📏 Service Radius: ${user.location?.serviceRadius || 5}km`);
      
      const filteredIssues = filterIssuesByUserLocation(issues, user.location);
      
      console.log(`📊 Results: ${filteredIssues.length}/${issues.length} issues visible to this user`);
      console.log('-'.repeat(40));
    }

    console.log('\n✅ User filtering test completed!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testUserFiltering();