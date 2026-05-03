require('dotenv').config();
const axios = require('axios');

async function testHF() {
  const token = process.env.HUGGING_FACE_TOKEN;
  const model = "google/vit-base-patch16-224";
  
  console.log(`Testing HF with token: ${token.substring(0, 10)}...`);
  
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/pipeline/image-classification/terrier.jpg" },
      {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("✅ Success!", JSON.stringify(response.data).substring(0, 100));
  } catch (err) {
    console.log("❌ Failed!");
    console.log("Status:", err.response?.status);
    console.log("Error:", JSON.stringify(err.response?.data?.error || err.message));
  }
}

testHF();
