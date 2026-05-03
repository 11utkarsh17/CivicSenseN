/**
 * 🧪 Image Recognition Test Script
 * This script tests the Hugging Face ML integration directly.
  */
require('dotenv').config({ path: './Backend/.env' });
if (!process.env.HUGGING_FACE_TOKEN) {
  require('dotenv').config({ path: '.env' }); // Fallback if already in Backend folder
}
const { classifyImage } = require('./utils/imageClassifier');

// A slightly larger 10x10 pixel white PNG base64 to avoid model dimension errors
const TEST_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAH0lEQVR42mP8/5+hnoGBAZ8YmKic0SBoGEfDMBpGAABHw353T16u/wAAAABJRU5ErkJggg==';

const fs = require('fs');
const path = require('path');

async function runTest() {
  console.log('🚀 Starting Image Recognition Test...');
  
  const token = process.env.HUGGING_FACE_TOKEN;
  if (!token || token === 'your_hugging_face_token_here') {
    console.error('❌ Error: HUGGING_FACE_TOKEN is not set in .env file.');
    console.log('Please get a token from https://huggingface.co/settings/tokens and add it to Backend/.env');
    return;
  }

  // Try to use a real image if available
  let testImageData = TEST_BASE64;
  const realImagePath = path.join(__dirname, '../Frontend/public/civicSenselogo.jpg');
  if (fs.existsSync(realImagePath)) {
    console.log('📸 Using real image for test:', realImagePath);
    testImageData = fs.readFileSync(realImagePath).toString('base64');
  } else {
    console.log('⚠️ Real image not found, using dummy base64.');
  }

  console.log('📡 Testing connectivity to Hugging Face API...');
  
  try {
    const result = await classifyImage(testImageData, 'Infrastructure', 'Testing the ML engine');
    
    console.log('\n--- Test Result ---');
    console.log(`Status: ${result.isValid ? '✅ Valid Civic Issue' : '❌ Rejected'}`);
    console.log(`Authentic: ${result.isAuthentic !== false ? '✅ Real Photo' : '❌ Fake/AI Detected'}`);
    console.log(`Message: ${result.message}`);
    if (result.details) {
      console.log(`AI Confidence: ${(result.details.confidence * 100).toFixed(0)}%`);
      console.log(`Issue Type: ${result.details.issue_type}`);
    }
    console.log('-------------------\n');

    if (result.message.includes('❌') && !result.isValid) {
      console.log('⚠️ Result: Image was rejected (this is normal for logos/dummy images).');
    } else {
      console.log('✅ Test Completed: The ML integration is working!');
    }
  } catch (error) {
    console.error('❌ Unexpected Error during test:', error);
  }
}

runTest();
