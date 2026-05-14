// 🚀 CivicSense API Server - MongoDB Atlas Version
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

// Debugging: Check if OpenAI key is loaded
if (process.env.OPENAI_API_KEY) {
  console.log('✅ OpenAI API Key loaded successfully');
} else {
  console.log('❌ OpenAI API Key NOT found in .env');
}

// Import database connection
const connectDatabase = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// 📡 Connect to MongoDB Atlas
connectDatabase();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Import simple routes
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const { getChatResponse } = require('./utils/chatbot'); // Import AI utility directly
const { checkLogin } = require('./middleware/auth'); // Import auth middleware

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

// 🤖 AI Assistant Routes
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Invalid message format' });
    }
    
    // Check for auth but don't block guest chat
    const authHeader = req.headers.authorization;
    console.log(`🤖 AI Request received (Auth: ${authHeader ? 'Yes' : 'No'})...`);
    
    const aiResponse = await getChatResponse(messages);
    res.json({ success: true, data: { reply: aiResponse } });
  } catch (error) {
    console.error('AI Route error:', error.message);
    res.status(500).json({ success: false, message: `AI Assistant error: ${error.message}` });
  }
});

app.get('/api/ai/test', (req, res) => {
  res.json({ success: true, message: 'AI Assistant API is online and ready!' });
});

// Home route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Welcome to CivicSense API!',
    status: 'Online',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CivicSense Server is running on port ${PORT}!`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📍 Local URL: http://localhost:${PORT}`);
    console.log(`\n📋 Available test accounts:`);
    console.log(`   Admin: admin@civic.com / admin123`);
    console.log(`   User:  user@civic.com / user123`);
  }
});

module.exports = app;
