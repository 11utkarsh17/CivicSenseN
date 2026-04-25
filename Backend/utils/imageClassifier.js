/**
 * 🔍 Image Recognition Utility
 * Uses Hugging Face API to identify civic issues and detect AI-generated images
 */

/**
 * Helper to fetch from Hugging Face Inference API with fallback URLs
 */
const hfFetch = async (modelId, body, apiToken) => {
  const url = `https://router.huggingface.co/hf-inference/models/${modelId}`;

  try {
    console.log(`📡 Trying HF API: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/octet-stream',
        'X-Wait-For-Model': 'true'
      },
      body: new Uint8Array(body)
    });

    if (response.ok) return response;
    
    const errorText = await response.text();
    console.warn(`⚠️ HF API failed with ${response.status}: ${errorText.substring(0, 100)}`);
    return response;
  } catch (err) {
    console.error(`❌ HF API error:`, err.message);
    throw err;
  }
};

/**
 * Checks if an image is AI-generated
 */
const checkAiGeneration = async (imageBuffer, apiToken) => {
  try {
    // Using a more stable model for AI detection
    const aiDetectorModel = 'Organika/sdxl-detector'; 
    const response = await hfFetch(aiDetectorModel, imageBuffer, apiToken);

    if (!response.ok) {
      console.error('AI Detector API failed:', response.status);
      return { isFake: false, score: 0, error: 'API Error' };
    }

    const predictions = await response.json();
    if (!Array.isArray(predictions)) return { isFake: false, score: 0, error: 'Invalid Format' };

    // Find the score for 'artificial' or 'fake'
    const fakePrediction = predictions.find(p => 
      ['artificial', 'fake', 'ai', 'synthetic', 'generated'].some(label => 
        p.label.toLowerCase().includes(label)
      )
    );
    
    const fakeScore = fakePrediction ? fakePrediction.score : 0;
    console.log(`🤖 AI Generation Check: Fake Score = ${(fakeScore * 100).toFixed(2)}%`);
    
    return { isFake: fakeScore > 0.8, score: fakeScore, error: null };
  } catch (error) {
    console.error('AI Detection logic error:', error);
    return { isFake: false, score: 0, error: error.message };
  }
};

/**
 * Classifies an image and checks if it contains civic-related content
 */
const classifyImage = async (base64Data) => {
  try {
    const apiToken = process.env.HUGGING_FACE_TOKEN;
    if (!apiToken) {
      console.error('Missing HUGGING_FACE_TOKEN');
      return { isValid: true, labels: [], message: 'Validation skipped: Missing API token.' };
    }

    const classifierModel = 'google/vit-base-patch16-224'; 
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // 1️⃣ FIRST: AI Generation Check (Optional, don't block if it fails)
    let aiCheck = { isFake: false };
    try {
      aiCheck = await checkAiGeneration(imageBuffer, apiToken);
      if (aiCheck.isFake) {
        return {
          isValid: false,
          labels: ['ai-generated'],
          message: `❌ Rejected: This image appears to be AI-generated (${(aiCheck.score * 100).toFixed(0)}% confidence). Please upload a real photograph.`
        };
      }
    } catch (e) {
      console.warn('AI Check failed, proceeding to classification:', e.message);
    }

    // 2️⃣ SECOND: Civic Content Check
    const response = await hfFetch(classifierModel, imageBuffer, apiToken);

    if (!response.ok) {
      return { isValid: true, labels: [], message: 'Validation skipped due to API error.' };
    }

    const predictions = await response.json();
    if (!Array.isArray(predictions)) return { isValid: true, labels: [], message: 'Invalid API response' };

    const labels = predictions.map(p => p.label.toLowerCase());
    console.log('AI detected labels:', labels.join(', '));


    const civicKeywords = [
      'road', 'street', 'pavement', 'asphalt', 'garbage', 'trash', 'waste',
      'pothole', 'crack', 'debris', 'litter', 'pollution', 'infrastructure',
      'construction', 'building', 'damage', 'broken', 'repair', 'maintenance',
      'utility', 'drain', 'sewer', 'pipe', 'water', 'flood', 'fire', 'smoke',
      'hazard', 'danger', 'safety', 'accident', 'traffic', 'vehicle', 'car',
      'truck', 'park', 'playground', 'bench', 'sign', 'signal', 'light',
      'electrical', 'wire', 'pole', 'tree', 'branch', 'foliage', 'landscape'
    ];

    const isCivicRelated = labels.some(label => 
      civicKeywords.some(keyword => label.includes(keyword))
    );

    if (isCivicRelated) {
      return {
        isValid: true,
        labels: labels,
        message: `Validated: ${labels.slice(0, 3).join(', ')}`
      };
    } else {
      return {
        isValid: false,
        labels: labels,
        message: `No civic issue detected. Found: ${labels.slice(0, 3).join(', ')}`
      };
    }

  } catch (error) {
    console.error('Image classification error:', error);
    return { isValid: true, labels: [], message: 'Validation skipped due to system error.' };
  }
};

module.exports = { classifyImage };
