/**
 * 🧪 Image Recognition Test Script
 * This script tests the Hugging Face ML integration directly.
 */
require('dotenv').config();
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
    const result = await classifyImage(testImageData);
    
    console.log('\n--- Test Result ---');
    console.log(`Status: ${result.isValid ? '✅ Valid Civic Issue' : '❌ Rejected (Expected for blank image)'}`);
    console.log(`Detected Labels: ${result.labels.join(', ') || 'None'}`);
    console.log(`Message: ${result.message}`);
    console.log('-------------------\n');

    if (result.message.includes('API error') || result.message.includes('failed')) {
      console.log('❌ Test Failed: There was an error communicating with the API.');
    } else {
      console.log('✅ Test Passed: The ML integration is communicating correctly with Hugging Face!');
      console.log('\nNext steps:');
      console.log('1. Run your backend: `npm start`');
      console.log('2. Try uploading a real photo of a road or trash in the app.');
      console.log('3. Watch the backend console for "🔍 Validating image..." logs.');
    }
  } catch (error) {
    console.error('❌ Unexpected Error during test:', error);
  }
}

runTest();
