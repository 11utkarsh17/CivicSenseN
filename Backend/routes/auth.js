// 🔐 Authentication Routes - MongoDB Atlas Version
const express = require('express');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For creating tokens
const User = require('../models/User'); // Import User model

const router = express.Router();

// 📝 Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, userType, department, location, designation, adminJurisdiction } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email: email,
      password: hashedPassword,
      name: name,
      userType: userType || 'user', // Use userType to match model
      department: department || null, // for admin users
      designation: designation || null, // for admin users
      location: location || null, // for regular users
      adminJurisdiction: adminJurisdiction || null // for admin users - their service area
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Create JWT token (Lasts for 30 days)
    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: savedUser._id,
          email: savedUser.email,
          name: savedUser.name,
          role: savedUser.userType, // Use userType from model
          department: savedUser.department,
          designation: savedUser.designation,
          location: savedUser.location,
          adminJurisdiction: savedUser.adminJurisdiction
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// 🔑 Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt for: ${email}`);

    // Find user in database
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Check password
    console.log(`🔄 Verifying password for: ${email}`);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for: ${email}`);
      return res.json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Create JWT token (Lasts for 30 days)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log(`✅ Login successful for: ${email} (${user.userType})`);
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.userType, // Use userType from model
          department: user.department,
          designation: user.designation,
          location: user.location,
          adminJurisdiction: user.adminJurisdiction
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// 🌐 Google Auth Route (Simplified for Demo/MVP)
router.post('/google', async (req, res) => {
  try {
    const { email, name, googleId, imageUrl } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if doesn't exist
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = new User({
        email,
        name,
        password: randomPassword, // Google users don't need password but model requires it
        userType: 'user',
        isActive: true
      });
      await user.save();
      console.log(`🆕 New user created via Google: ${email}`);
    }

    // Create JWT token (Lasts for 30 days)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Google Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.userType,
          location: user.location
        },
        token: token
      }
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});

module.exports = router;
