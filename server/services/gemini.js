/**
 * Sends a request to the Gemini API with a multi-model fallback strategy.
 * @param {string} prompt - The system and user prompt.
 * @param {string} apiKey - The user's Gemini API key.
 * @param {string} complexity - The complexity tier ('low' or 'high').
 * @returns {Promise<object>} Parsed JSON response.
 */
async function callGemini(prompt, apiKey, complexity = 'low') {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing.");
  }

  const MODELS = complexity === 'high' ? ['gemini-3.6-flash', 'gemini-3.5-flash-lite'] : ['gemini-3.5-flash-lite'];

  for (let i = 0; i < MODELS.length; i++) {
    const modelName = MODELS[i];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          }
        })
      });

      if (!response.ok) {
        let errorMessage = `API Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          // Ignore JSON parse failure
        }
        
        const isRateLimit = response.status === 429 || errorMessage.toLowerCase().includes('quota exceeded');
        
        if (isRateLimit) {
          if (i < MODELS.length - 1) {
            console.warn(`Rate limit hit for ${modelName}, falling back to next model...`);
            continue;
          } else {
            throw new Error("RATE_LIMIT: Quota exceeded. Please try again in 30s.");
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      try {
        let textResponse = data.candidates[0].content.parts[0].text;
        textResponse = textResponse.replace(/^```json/mi, '').replace(/```$/m, '').trim();
        return JSON.parse(textResponse);
      } catch (err) {
        console.error("Failed to parse Gemini response text as JSON:", err, data);
        throw new Error("Failed to parse AI response. Please try again.");
      }
    } catch (err) {
      if (err.message.startsWith("RATE_LIMIT") || i === MODELS.length - 1) {
        throw err;
      }
      console.warn(`Error using ${modelName}: ${err.message}. Falling back to next model...`);
    }
  }
}

/**
 * Generates a complete learning roadmap for a given topic.
 */
export async function generateRoadmap(topic, apiKey, complexity = 'high') {
  const prompt = `
    You are an expert curriculum planner and educator.
    Create a comprehensive and structured learning roadmap for the topic: "${topic}".
    
    Structure the roadmap into 3 logical chronological phases (e.g. Foundations, Intermediate, Advanced).
    Each phase should contain 2-4 critical node items to learn.
    Each node must have a unique ID, a concise title, a brief 1-2 sentence description, and an estimated time to learn.
    
    You MUST respond with a raw JSON object matching the following structure exactly (no markdown formatting, no comments, just valid JSON):
    {
      "title": "Roadmap Title (e.g., HTML & CSS or Machine Learning)",
      "description": "A high-level description of what this roadmap covers.",
      "phases": [
        {
          "id": "unique-phase-id (e.g., phase-1)",
          "title": "Phase Name (e.g., 1. The Foundations)",
          "description": "Short explanation of the phase's goal.",
          "nodes": [
            {
              "id": "unique-node-id (e.g., css-basics)",
              "title": "Node/Skill Title (e.g., CSS Layouts)",
              "description": "Brief description of what to learn and master.",
              "estimatedTime": "Estimated time (e.g., 1 week, 3 days)"
            }
          ]
        }
      ]
    }
  `;

  return await callGemini(prompt, apiKey, complexity);
}

/**
 * Generates a detailed sub-roadmap for a specific sub-topic within a larger topic.
 */
export async function generateSubRoadmap(parentTopic, subTopic, apiKey, complexity = 'high') {
  const prompt = `
    You are an expert educator. The user is learning "${parentTopic}" and wants to deep-dive into "${subTopic}".
    Create a highly detailed, specialized sub-roadmap specifically for "${subTopic}" within the context of "${parentTopic}".
    
    Break it down into 2-3 logical chronological sub-phases.
    Each sub-phase should contain 2-3 specific sub-topics/nodes to master.
    
    You MUST respond with a raw JSON object matching the following structure exactly (no markdown, no comments, just valid JSON):
    {
      "title": "${subTopic} Deep Dive",
      "description": "A focused sub-roadmap dedicated to mastering ${subTopic}.",
      "phases": [
        {
          "id": "sub-phase-id (e.g., sub-phase-1)",
          "title": "Sub-Phase Title (e.g., 1. Core Mechanics)",
          "description": "Short explanation of this sub-phase's goal.",
          "nodes": [
            {
              "id": "unique-subnode-id (e.g., react-hooks-usestate)",
              "title": "Specific Topic Name",
              "description": "Detailed description of what to learn.",
              "estimatedTime": "Estimated time (e.g., 1 day, 6 hours)"
            }
          ]
        }
      ]
    }
  `;

  return await callGemini(prompt, apiKey, complexity);
}

/**
 * Fetches high-quality links and resources for a topic.
 */
export async function generateResources(topic, apiKey, complexity = 'low') {
  const prompt = `
    You are a research assistant. Provide 3-4 high-quality, real, and helpful learning resources for the topic: "${topic}".
    These resources should ideally include official documentation, popular free courses/videos, interactive playgrounds, or highly-rated articles.
    
    Provide valid URLs. If you don't know the exact URL, provide a search query URL (like a YouTube or Google search) or a reliable domain (like developer.mozilla.org, react.dev, or freecodecamp.org).
    
    You MUST respond with a raw JSON array matching this structure exactly (no markdown, no comments, just valid JSON):
    [
      {
        "title": "Title of the resource (e.g., A Complete Guide to Flexbox or Official React Tutorial)",
        "type": "one of: documentation | video | article | book | tutorial | interactive",
        "url": "Valid HTTP/HTTPS URL",
        "platform": "Name of the platform hosting the resource (e.g., YouTube, MDN, Dev.to, Coursera, FreeCodeCamp)"
      }
    ]
  `;

  return await callGemini(prompt, apiKey, complexity);
}

/**
 * Generates the next question for the dynamic onboarding quiz.
 */
export async function generateQuizStep(userCategory, initialInterests, history, stepNumber, apiKey, complexity = 'low') {
  const prompt = `
    You are a career and learning profiling agent. The user is a ${userCategory} who has already indicated their core interests are: ${initialInterests.join(', ')}. Your job is to drill down into these specific areas. Based on their answer history, ask the next multiple-choice question to uncover their specific sub-niches, preferred tools, or learning styles within ${initialInterests.join(', ')}. 
    
    Current Step Number: ${stepNumber}
    User History: ${JSON.stringify(history)}
    
    You must respond ONLY with a raw JSON object. Do not include markdown formatting, markdown code blocks (like \`\`\`json), or any conversational text. The JSON keys must strictly be: "question" (string), "options" (array of exactly 4 strings), and "treeNodeLabel" (string).
  `;

  return await callGemini(prompt, apiKey, complexity);
}

/**
 * Generates 3 specific roadmap titles based on the user's completed interest tree.
 */
export async function generatePresets(interestTree, apiKey, complexity = 'low') {
  const prompt = `
    You are a creative roadmap planner. The user has completed a profile quiz with the following path: ${JSON.stringify(interestTree)}.
    
    Generate exactly 3 highly specific, creative roadmap titles based on their exact tree path (e.g., if the tree is Technical -> Software -> AI -> Generative, suggest "Building Your First LLM App").
    
    Return strict JSON with an array of exactly 3 strings (the roadmap titles).
    Do NOT include markdown formatting or comments. Just valid JSON array of strings.
  `;

  return await callGemini(prompt, apiKey, complexity);
}
