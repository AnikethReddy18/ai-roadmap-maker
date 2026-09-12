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
 * Generates a complete learning roadmap for a given topic with embedded study resources per node.
 */
export async function generateRoadmap(topic, apiKey, complexity = 'high') {
  const prompt = `
    You are an expert curriculum planner and educator.
    Create a comprehensive and structured learning roadmap for the topic: "${topic}".
    
    Structure the roadmap into 3 logical chronological phases (e.g. Foundations, Intermediate, Advanced).
    Each phase should contain 2-4 critical node items to learn.
    Each node must have a unique ID, a concise title, a brief 1-2 sentence description, an estimated time to learn, AND a populated array "resources" containing 3-4 high-quality learning resources (official docs, videos, interactive tutorials, or articles).
    
    You MUST respond with a raw JSON object matching the following structure exactly (no markdown formatting, no comments, just valid JSON):
    {
      "title": "Roadmap Title (e.g., HTML & CSS or Machine Learning)",
      "description": "A high-level description of what this roadmap covers.",
      "phases": [
        {
          "id": "phase-1",
          "title": "Phase Name (e.g., 1. The Foundations)",
          "description": "Short explanation of the phase's goal.",
          "nodes": [
            {
              "id": "node-1",
              "title": "Node/Skill Title (e.g., CSS Layouts)",
              "description": "Brief description of what to learn and master.",
              "estimatedTime": "1 week",
              "resources": [
                {
                  "title": "MDN CSS Layouts Guide",
                  "type": "documentation",
                  "url": "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout",
                  "platform": "MDN Web Docs"
                },
                {
                  "title": "CSS Grid & Flexbox Crash Course",
                  "type": "video",
                  "url": "https://www.youtube.com/results?search_query=css+grid+flexbox+tutorial",
                  "platform": "YouTube"
                }
              ]
            }
          ]
        }
      ]
    }
  `;

  return await callGemini(prompt, apiKey, complexity);
}

/**
 * Generates a detailed sub-roadmap with embedded study resources per node.
 */
export async function generateSubRoadmap(parentTopic, subTopic, apiKey, complexity = 'high') {
  const prompt = `
    You are an expert educator. The user is learning "${parentTopic}" and wants to deep-dive into "${subTopic}".
    Create a highly detailed, specialized sub-roadmap specifically for "${subTopic}" within the context of "${parentTopic}".
    
    Break it down into 2-3 logical chronological sub-phases with 2-3 specific sub-nodes per phase.
    Each node MUST include a populated array "resources" containing 3-4 high-quality study resources.
    
    You MUST respond with a raw JSON object matching this structure exactly (no markdown, no comments, just valid JSON):
    {
      "title": "${subTopic} Deep Dive",
      "description": "A focused sub-roadmap dedicated to mastering ${subTopic}.",
      "phases": [
        {
          "id": "sub-phase-1",
          "title": "Sub-Phase Title (e.g., 1. Core Mechanics)",
          "description": "Short explanation of this sub-phase's goal.",
          "nodes": [
            {
              "id": "subnode-1",
              "title": "Specific Topic Name",
              "description": "Detailed description of what to learn.",
              "estimatedTime": "3 days",
              "resources": [
                {
                  "title": "Official Deep Dive Guide",
                  "type": "documentation",
                  "url": "https://react.dev/learn",
                  "platform": "Official Docs"
                }
              ]
            }
          ]
        }
      ]
    }
  `;

  return await callGemini(prompt, apiKey, complexity);
}

/**
 * Generates a 10-question multiple-choice evaluation quiz covering all topics in a roadmap.
 */
export async function generateCourseQuiz(roadmapTitle, phases, apiKey, complexity = 'high') {
  const prompt = `
    You are an academic assessment designer. Create a 10-question multiple-choice evaluation quiz for the completed course: "${roadmapTitle}".
    The roadmap consists of the following phases and topics: ${JSON.stringify(phases)}.
    
    Create exactly 10 questions testing practical understanding of these concepts.
    Each question must have:
    - id: unique string (e.g., "q1", "q2")
    - targetSkill: the specific node/skill title being tested
    - question: clear multiple-choice question
    - options: array of exactly 4 strings
    - correctIndex: integer 0, 1, 2, or 3 indicating the correct choice
    - explanation: short 1-sentence explanation of the correct choice
    
    Respond ONLY with a raw JSON array of 10 question objects.
  `;

  return await callGemini(prompt, apiKey, complexity);
}

/**
 * Generates a remedial roadmap specifically targeting identified weak topics, with embedded resources per node.
 */
export async function generateRemedialRoadmap(roadmapTitle, weakTopics, apiKey, complexity = 'high') {
  const prompt = `
    You are an adaptive learning coach. The user completed "${roadmapTitle}" but struggled on the evaluation quiz in these specific weak areas: ${weakTopics.join(', ')}.
    
    Create a highly focused, remedial review roadmap designed to fix these knowledge gaps and achieve mastery.
    Break it down into 2 logical phases:
    1. Rebuilding Fundamentals (focusing on core concepts of ${weakTopics.slice(0, 2).join(', ')})
    2. Practical Application & Mastery (hands-on practice for ${weakTopics.slice(2).join(', ') || weakTopics[0]})
    
    Each node MUST include a populated array "resources" containing 3-4 study links specifically targeted at fixing these weak spots.
    
    Respond ONLY with raw JSON matching the standard roadmap format ({ "title": "...", "description": "...", "phases": [...] }).
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
    
    Generate exactly 3 highly specific, creative roadmap titles based on their exact tree path.
    
    Return strict JSON with an array of exactly 3 strings (the roadmap titles).
  `;

  return await callGemini(prompt, apiKey, complexity);
}
