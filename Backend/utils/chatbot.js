/**
 * 🤖 AI Chatbot Utility - Enhanced CivicSense Version
 * Supports both OpenAI and Hugging Face with domain-specific knowledge.
 */

const getChatResponse = async (messages) => {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const hfToken = process.env.HUGGING_FACE_TOKEN;

    // Domain-specific knowledge base for CivicSense
    const systemPrompt = `You are CivicSense AI, the official assistant for the CivicSense platform. 
    CivicSense is a crowdsourced civic issue reporting system that empowers citizens to improve their communities.

    Your Knowledge Base:
    1. Reporting Issues: Citizens can report issues like potholes, street light failures, garbage, and water leakage. They can upload photos and provide locations.
    2. Voting & Community: Other citizens can 'upvote' reported issues to show importance. This helps authorities prioritize which issues to fix first.
    3. Tracking: Users can track the status of their reports (Pending, In Progress, Resolved).
    4. Admin Dashboard: Government authorities have a special dashboard to manage, assign, and update the status of reported issues.
    5. Mission: Our mission is to bridge the gap between citizens and local authorities through transparency and collective action.

    Guidelines:
    - Be professional, helpful, and concise.
    - If a user asks how to report an issue, explain that they can use the "Report Issue" button on their dashboard.
    - If a user asks about an issue status, explain that they can see all their reported issues and their current status in the dashboard.
    - Always maintain a positive and community-focused tone.
    - Use the platform name "CivicSense" whenever referring to the service.`;

    // Try OpenAI first if key is available
    if (openaiKey && !openaiKey.includes('your-')) {
      try {
        console.log('🤖 Real AI Mode: Sending request to OpenAI...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini', // Fast and smart enough for this
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages
            ],
            max_tokens: 300,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.choices[0].message.content.trim();
        } else {
          const err = await response.text();
          console.warn('OpenAI API error, falling back to Hugging Face:', err);
        }
      } catch (openaiError) {
        console.error('OpenAI fetch error:', openaiError.message);
      }
    }

    // Fallback to Mock Response Mode if BOTH keys are missing or placeholders
    if ((!openaiKey || openaiKey.includes('your-')) && (!hfToken || hfToken.includes('your-'))) {
      const lastMessage = messages[messages.length - 1].content.toLowerCase();
      console.log(`🤖 AI Mock Mode processing: "${lastMessage}"`);
      
      // Smart Keyword Matcher
      if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('hey')) {
        return "Hello! I am CivicSense AI. I'm currently running in **Offline Mode** because no API keys were found, but I can still help you navigate the platform! What would you like to know?";
      }
      if (lastMessage.includes('pothole') || lastMessage.includes('road') || lastMessage.includes('infrastructure')) {
        return "To report a pothole or road damage: \n1. Go to your Dashboard\n2. Click 'Report Issue'\n3. Select 'Infrastructure' category\n4. Upload at least 2 clear photos of the damage.\n\nOur system will then notify the PWD department.";
      }
      if (lastMessage.includes('garbage') || lastMessage.includes('waste') || lastMessage.includes('clean')) {
        return "Sanitation issues are a priority! You can report uncollected garbage or overflowing bins by selecting the 'Sanitation' category in the 'Report Issue' form. Don't forget to enable location services so we can pin the exact spot!";
      }
      if (lastMessage.includes('water') || lastMessage.includes('leak') || lastMessage.includes('pipe')) {
        return "For water-related issues like leakages or no supply, please use the 'Public Health' or 'Other' category (or 'Jal Board' if available). Detailed descriptions help the authorities fix it faster!";
      }
      if (lastMessage.includes('light') || lastMessage.includes('dark') || lastMessage.includes('electricity')) {
        return "Broken street lights can be reported under 'Public Safety'. This helps our local authorities ensure the streets are safe for everyone at night.";
      }
      if (lastMessage.includes('vote') || lastMessage.includes('upvote')) {
        return "Upvoting is powerful! When many citizens upvote an issue, it moves to the top of the Admin's list, signaling that the community considers it a high priority.";
      }
      if (lastMessage.includes('status') || lastMessage.includes('track')) {
        return "You can track your issues in the 'My Reports' tab. 'Open' means reported, 'In Progress' means an official is looking into it, and 'Resolved' means the work is done!";
      }
      if (lastMessage.includes('admin') || lastMessage.includes('official')) {
        return "Government officials have a dedicated dashboard where they see issues specifically within their jurisdiction (city/pincode). They can update the status as they resolve the problem.";
      }
      
      return "I'm CivicSense AI, currently in **Offline Mode**. You can ask me about reporting potholes, garbage collection, street lights, voting on issues, or tracking your report status!";
    }

    // Fallback to Hugging Face
    if (hfToken && !hfToken.includes('your-')) {
      const models = [
        'Qwen/Qwen2.5-Coder-32B-Instruct',
        'mistralai/Mistral-7B-Instruct-v0.3',
        'HuggingFaceH4/zephyr-7b-beta'
      ];

      let lastChatError = null;

      for (const model of models) {
        try {
          console.log(`🤖 Real AI Mode: Trying Hugging Face Router with model: ${model}`);
          const apiUrl = 'https://router.huggingface.co/v1/chat/completions';

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${hfToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'system', content: systemPrompt },
                ...messages
              ],
              max_tokens: 300,
              temperature: 0.7
            })
          });

          if (response.ok) {
            const data = await response.json();
            return data.choices[0].message.content.trim();
          }

          const errorData = await response.json().catch(() => ({}));
          console.warn(`⚠️ HF Router Error (${model}):`, response.status, errorData);
          lastChatError = { status: response.status, data: errorData };
        } catch (err) {
          console.error(`❌ HF Chat error (${model}):`, err.message);
          lastChatError = err;
        }
      }

      if (lastChatError?.status === 503 || lastChatError?.status === 429) {
        return "The AI service is currently busy. Please try again in a few moments.";
      }
    }

    return "I'm experiencing some technical difficulties. Please try again later.";

  } catch (error) {
    console.error('Chatbot utility error:', error);
    return "I'm experiencing some technical difficulties. Please try again later.";
  }
};

module.exports = { getChatResponse };
