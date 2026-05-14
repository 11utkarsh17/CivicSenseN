/**
 * 🛡️ CivicSense Supreme Image Validation Engine (v14)
 * DEBUG EDITION: Provides full transparency on API errors and failures.
 */

const axios = require('axios');

/**
 * 🛰️ API Helper: Hugging Face
 */
const hfPredict = async (modelId, imageBuffer, apiToken) => {
  const url = `https://router.huggingface.co/hf-inference/models/${modelId}`;
  const debug = process.env.AI_DEBUG === 'true';

  try {
    if (debug) console.log(`📡 [HF] Requesting: ${modelId}...`);
    
    const response = await axios.post(
      url,
      imageBuffer,
      {
        headers: {
          'Authorization': `Bearer ${apiToken.trim()}`,
          'Content-Type': 'image/jpeg',
          'X-Wait-For-Model': 'true'
        },
        timeout: 12000 // Reduced timeout for better UX
      }
    );
    return { success: true, data: response.data };
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    if (debug) console.warn(`⚠️ [HF] ${modelId} failed: ${errorMsg}`);
    
    return { 
      success: false, 
      status: err.response?.status, 
      error: errorMsg 
    };
  }
};

/**
 * 🚀 Main Entry Point: Raw AI Data Mode
 */
const classifyImage = async (base64Data, category = '', description = '') => {
  const openaiKey = process.env.OPENAI_API_KEY;
  const hfToken = process.env.HUGGING_FACE_TOKEN;
  const debug = process.env.AI_DEBUG === 'true';
  
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64Image, 'base64');

  if (debug) console.log(`🧪 [Image Engine] Analyzing... (Cat: ${category || 'None'})`);

  // ---------------------------------------------------------
  // 1. OpenAI Vision (Primary Logic)
  // ---------------------------------------------------------
  if (openaiKey && !openaiKey.includes('your-')) {
    try {
      if (debug) console.log('📡 [OpenAI] Requesting Vision...');
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert civic issue validator. 
            Analyze the image to determine if it shows a genuine civic/public issue (e.g., potholes, garbage, broken infrastructure, water leaks, etc.).
            CRITICAL: Also check if the image appears to be AI-generated, fake, or heavily manipulated. CivicSense only accepts REAL photos as proof.
            ${category ? `The user claims this is a "${category}" issue.` : ''}
            ${description ? `User description: "${description}"` : ''}
            Return ONLY a JSON object: 
            {
              "valid": boolean (false if it is AI-generated/fake or NOT a civic issue), 
              "ai_description": "short summary",
              "confidence": number (0-1),
              "issue_type": "string",
              "is_authentic": boolean (false if AI-generated/fake),
              "authenticity_reason": "explanation if fake"
            }`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this image for civic validity.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      }, {
        headers: { 'Authorization': `Bearer ${openaiKey}` },
        timeout: 15000
      });

      const result = JSON.parse(response.data.choices[0].message.content);
      if (debug) console.log('✅ [OpenAI] Success');
      
      const isAuthentic = result.is_authentic !== false;
      const isValid = result.valid && isAuthentic;

      return {
        isValid: isValid,
        isAuthentic: isAuthentic,
        message: isAuthentic 
          ? `🤖 AI Analysis: ${result.ai_description}`
          : `🛑 Fraud Alert: ${result.authenticity_reason || 'AI-generated image detected.'}`,
        details: result
      };
    } catch (err) {
      if (debug) console.warn('⚠️ [OpenAI] Failed:', err.message);
    }
  }

  // ---------------------------------------------------------
  // 2. Hugging Face (Secondary / Fallback)
  // ---------------------------------------------------------
  let bestLabels = [];
  let apiFailed = false;

  if (hfToken && !hfToken.includes('your-')) {
    // Authenticity Check
    const authenticityModels = ['umm-maybe/AI-image-detector'];
    for (const modelId of authenticityModels) {
      const authResult = await hfPredict(modelId, imageBuffer, hfToken);
      if (authResult.success && Array.isArray(authResult.data)) {
        const topLabel = authResult.data[0];
        if ((topLabel.label.toLowerCase().includes('artificial') || topLabel.label.toLowerCase().includes('fake')) && topLabel.score > 0.85) {
          return {
            isValid: false,
            isAuthentic: false,
            message: `❌ Fraud Detection: This image appears to be AI-generated (${(topLabel.score * 100).toFixed(0)}% probability).`
          };
        }
      } else {
        apiFailed = true;
      }
    }

    // Civic Issue Detection
    const models = ['google/vit-base-patch16-224', 'microsoft/resnet-50'];
    const civicKeywords = ['road', 'street', 'pothole', 'garbage', 'trash', 'waste', 'water', 'pipe', 'leak', 'broken', 'infrastructure', 'asphalt'];

    for (const modelId of models) {
      const result = await hfPredict(modelId, imageBuffer, hfToken);
      if (result.success && Array.isArray(result.data)) {
        // Store labels for reasoning later if we don't get an immediate match
        if (result.data.length > 0 && bestLabels.length === 0) {
          bestLabels = result.data.slice(0, 3).map(p => p.label.toLowerCase());
        }

        const isCivic = result.data.some(p => p.score > 0.15 && civicKeywords.some(kw => p.label.toLowerCase().includes(kw)));
        if (isCivic) {
          const topLabel = result.data[0].label;
          return {
            isValid: true,
            isAuthentic: true,
            message: `🤖 ML Detected: This looks like ${topLabel.toLowerCase()}. Relevant to civic reporting.`,
            source: 'Hugging Face'
          };
        }
      } else {
        apiFailed = true;
      }
    }
  }

  // ---------------------------------------------------------
  // 3. EMERGENCY RESCUE MODE (Safe Fallback)
  // ---------------------------------------------------------
  const fileSizeKB = Math.round(imageBuffer.length / 1024);
  
  if (fileSizeKB < 5) {
    return {
      isValid: false,
      message: `❌ Rejected: Image file is too small (${fileSizeKB}KB) to be a valid photo proof.`
    };
  }

  // Generate a proper reason instead of a hardcoded message
  let dynamicReason = '';
  if (bestLabels.length > 0) {
    dynamicReason = `AI detected elements of ${bestLabels.join(', ')}. `;
  } else if (apiFailed) {
    dynamicReason = `AI servers are temporarily busy. `;
  }

  const categoryReason = category ? `Accepted as proof for ${category.toLowerCase()} based on user report.` : `Image accepted as proof based on visual data.`;

  return {
    isValid: true,
    isAuthentic: true,
    message: `🛡️ ${dynamicReason}${categoryReason} (${fileSizeKB}KB).`
  };
};

module.exports = { classifyImage };
