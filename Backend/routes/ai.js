const express = require('express');
const router = express.Router();
const { checkLogin } = require('../middleware/auth');
const { getChatResponse } = require('../utils/chatbot');

/**
 * 🤖 AI Test Endpoint
 * GET /api/ai/test
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'AI Assistant API is online and ready!'
  });
});

/**
 * 🤖 AI Chatbot Endpoint
 * POST /api/ai/chat
 */
router.post('/chat', checkLogin, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message format'
      });
    }

    console.log('🤖 AI Request received...');
    const aiResponse = await getChatResponse(messages);

    res.json({
      success: true,
      data: {
        reply: aiResponse
      }
    });
  } catch (error) {
    console.error('AI Route error:', error);
    res.status(500).json({
      success: false,
      message: 'AI Assistant is temporarily unavailable. Please try again later.'
    });
  }
});

module.exports = router;
