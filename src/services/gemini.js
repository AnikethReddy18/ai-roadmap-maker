// Service to communicate with Google's Gemini API directly from the client side.

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

/**
 * Sends a request to the Gemini API.
 * @param {string} prompt - The system and user prompt.
 * @param {string} apiKey - The user's Gemini API key.
 * @returns {Promise<object>} Parsed JSON response.
 */
async function callGemini(prompt, apiKey) {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please set it in the Settings.");
  }

  const url = `${GEMINI_API_URL}?key=${apiKey}`;
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
        temperature: 0.2, // Lower temperature for more structured, factual outputs
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
      // Ignore JSON parse failure for error response
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  try {
    const textResponse = data.candidates[0].content.parts[0].text;
    return JSON.parse(textResponse);
  } catch (err) {
    console.error("Failed to parse Gemini response text as JSON:", err, data);
    throw new Error("Failed to parse AI response. Please try again.");
  }
}

/**
 * Generates a complete learning roadmap for a given topic.
 * @param {string} topic - The subject of the roadmap.
 * @param {string} apiKey - The Gemini API key.
 */
export async function generateRoadmap(topic, apiKey) {
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

  return await callGemini(prompt, apiKey);
}

/**
 * Generates a detailed sub-roadmap for a specific sub-topic within a larger topic.
 * @param {string} parentTopic - The main topic (context).
 * @param {string} subTopic - The specific node topic.
 * @param {string} apiKey - The Gemini API key.
 */
export async function generateSubRoadmap(parentTopic, subTopic, apiKey) {
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

  return await callGemini(prompt, apiKey);
}

/**
 * Fetches high-quality links and resources for a topic.
 * @param {string} topic - The topic to get resources for.
 * @param {string} apiKey - The Gemini API key.
 */
export async function generateResources(topic, apiKey) {
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

  return await callGemini(prompt, apiKey);
}
