/**
 * Secure Backend AI Service (Google Gemini Vision & Text)
 * API keys remain strictly on the backend.
 * Provides fallback to local rule engines if API key is not configured or network fails.
 */

const { analyzeTextSymptoms, EMERGENCY_GUIDES, DEFAULT_GUIDE } = require('./knowledgeBase');
const { analyzePhotoLocal } = require('./visualAnalyzer');

let activeApiKey = process.env.GEMINI_API_KEY || "";

function setApiKey(key) {
  if (typeof key === 'string') {
    activeApiKey = key.trim();
  }
}

function getApiKey() {
  return activeApiKey;
}

function hasApiKey() {
  return Boolean(activeApiKey && activeApiKey.length > 10);
}

/**
 * Call Gemini API using native Node.js fetch
 */
async function callGeminiApi(modelName, contents, systemInstruction) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("No Gemini API key configured.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const payload = {
    contents: contents,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 2048,
      responseMimeType: "application/json"
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error("Empty response from Gemini API.");
  }

  return JSON.parse(textOutput);
}

/**
 * AI-assisted Text Analysis with Gemini
 */
async function analyzeText(text) {
  if (!hasApiKey()) {
    // Local Rule-Based Engine
    const local = analyzeTextSymptoms(text);
    return {
      isDemoMode: false,
      engine: "FirstAid+ Local Clinical Knowledge Base",
      possibleEmergency: local.possibleEmergency || local.title,
      severity: local.severity,
      whatHappened: local.whatHappened,
      warningSigns: local.warningSigns,
      immediateFirstAid: local.immediateFirstAid,
      whatNotToDo: local.whatNotToDo,
      whenToGetHelp: local.whenToGetHelp,
      emergencyCallRequired: local.emergencyCallRequired,
      safetyDisclaimer: "FirstAid+ is an educational first-aid assistant. Text and photo analysis may be inaccurate and cannot diagnose injuries. Do not delay emergency care to use this app. If the person is in immediate danger, call 112 in India.",
      matchedKeywords: local.matchedKeywords || []
    };
  }

  const systemPrompt = `You are FirstAid+, an educational first-aid emergency triage assistant.
Analyze the user's description of a medical emergency or injury.
Adhere strictly to these rules:
1. Suggest a POSSIBLE emergency category, never a definitive medical diagnosis.
2. Rate severity strictly as one of:
   - "Low" (Basic first aid may be sufficient, but monitor the condition)
   - "Moderate" (Medical evaluation may be needed)
   - "High" (Seek urgent medical care)
   - "Critical" (Call emergency services immediately)
3. Never falsely guarantee that an injury is minor or safe.
4. Output must be strictly valid JSON matching this schema:
{
  "possibleEmergency": "string (e.g. Possible 2nd-degree thermal scald burn)",
  "severity": "Low" | "Moderate" | "High" | "Critical",
  "whatHappened": "string (simple explanation of what might have happened)",
  "warningSigns": ["array of warning symptoms to look for"],
  "immediateFirstAid": ["array of clear, actionable numbered steps"],
  "whatNotToDo": ["array of harmful actions to avoid"],
  "whenToGetHelp": "string (clearly explaining when to visit hospital or call ambulance)",
  "emergencyCallRequired": boolean (true if 112 should be called immediately)
}`;

  try {
    const aiResult = await callGeminiApi(
      "gemini-2.5-flash",
      [{ parts: [{ text: text }] }],
      systemPrompt
    );

    return {
      isDemoMode: false,
      engine: "Gemini 2.5 Flash AI Engine",
      possibleEmergency: aiResult.possibleEmergency,
      severity: aiResult.severity,
      whatHappened: aiResult.whatHappened,
      warningSigns: aiResult.warningSigns || [],
      immediateFirstAid: aiResult.immediateFirstAid || [],
      whatNotToDo: aiResult.whatNotToDo || [],
      whenToGetHelp: aiResult.whenToGetHelp,
      emergencyCallRequired: Boolean(aiResult.emergencyCallRequired || aiResult.severity === "Critical"),
      safetyDisclaimer: "FirstAid+ is an educational first-aid assistant. Text and photo analysis may be inaccurate and cannot diagnose injuries. Do not delay emergency care to use this app. If the person is in immediate danger, call 112 in India."
    };
  } catch (error) {
    console.error("Gemini text analysis failed, falling back to local engine:", error.message);
    const local = analyzeTextSymptoms(text);
    return {
      isDemoMode: false,
      engine: "FirstAid+ Local Clinical Engine (Fallback)",
      fallbackReason: error.message,
      possibleEmergency: local.possibleEmergency || local.title,
      severity: local.severity,
      whatHappened: local.whatHappened,
      warningSigns: local.warningSigns,
      immediateFirstAid: local.immediateFirstAid,
      whatNotToDo: local.whatNotToDo,
      whenToGetHelp: local.whenToGetHelp,
      emergencyCallRequired: local.emergencyCallRequired,
      safetyDisclaimer: "FirstAid+ is an educational first-aid assistant. Text and photo analysis may be inaccurate and cannot diagnose injuries. Do not delay emergency care to use this app. If the person is in immediate danger, call 112 in India."
    };
  }
}

/**
 * AI-assisted Photograph Analysis with Gemini Vision
 */
async function analyzePhoto(base64Data, mimeType = "image/jpeg", description = "") {
  if (!hasApiKey()) {
    // Return Local Rule & Visual Heuristic Engine
    return analyzePhotoLocal(base64Data, { description });
  }

  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

  const systemPrompt = `You are FirstAid+, an educational first-aid visual triage assistant.
You are inspecting an uploaded image of a visible injury, accident scene, burn, swelling, bleeding, or other physical symptom.
CRITICAL PHOTO ANALYSIS RULES:
- Inspect the visible image for relevant features.
- Describe ONLY what is visually observable.
- Suggest a possible injury category, NOT a definitive diagnosis.
- Mention when the photo is unclear, poorly lit, or insufficient.
- Never invent symptoms that cannot be seen.
- Do not identify an internal injury or systemic disease solely from a photo.
- DO NOT declare the person safe based only on the image.
- If there is heavy bleeding, breathing distress, unconsciousness, or life-threatening sign, prioritize emergency instructions (Severity: Critical).
- If the photo shows an uncertain condition, include: "uncertaintyNotice": "Image analysis cannot confirm the type or severity of this injury. Please seek professional medical evaluation if you are concerned."
- Classify severity strictly as: "Low", "Moderate", "High", or "Critical".
- Output must be strict JSON:
{
  "possibleEmergency": "string (e.g. Possible superficial laceration with localized erythema)",
  "severity": "Low" | "Moderate" | "High" | "Critical",
  "observableFeatures": ["array of what is visibly seen"],
  "whatHappened": "string (simple explanation of possible visible injury)",
  "warningSigns": ["array of warning symptoms to look for"],
  "immediateFirstAid": ["array of clear numbered first aid steps"],
  "whatNotToDo": ["array of harmful actions to avoid"],
  "whenToGetHelp": "string",
  "emergencyCallRequired": boolean,
  "uncertaintyNotice": "string or null"
}`;

  try {
    const contents = [
      {
        parts: [
          {
            text: description ? `Context provided: ${description}` : "Analyze this image for visible injury/emergency features following the strict photo analysis rules."
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          }
        ]
      }
    ];

    const aiResult = await callGeminiApi("gemini-2.5-flash", contents, systemPrompt);

    return {
      isDemoMode: false,
      engine: "Gemini 2.5 Flash Vision AI",
      possibleEmergency: aiResult.possibleEmergency,
      severity: aiResult.severity,
      observableFeatures: aiResult.observableFeatures || [],
      whatHappened: aiResult.whatHappened,
      warningSigns: aiResult.warningSigns || [],
      immediateFirstAid: aiResult.immediateFirstAid || [],
      whatNotToDo: aiResult.whatNotToDo || [],
      whenToGetHelp: aiResult.whenToGetHelp,
      emergencyCallRequired: Boolean(aiResult.emergencyCallRequired || aiResult.severity === "Critical"),
      uncertaintyNotice: aiResult.uncertaintyNotice || null,
      safetyDisclaimer: "FirstAid+ is an educational first-aid assistant. Text and photo analysis may be inaccurate and cannot diagnose injuries. Do not delay emergency care to use this app. If the person is in immediate danger, call 112 in India."
    };
  } catch (error) {
    console.error("Gemini Vision failed, falling back to local heuristic analyzer:", error.message);
    const local = analyzePhotoLocal(base64Data, { description });
    local.fallbackReason = error.message;
    return local;
  }
}

/**
 * Conversational Assistant Triage Dialogue (Section 6)
 */
async function processChatMessage(userMessage, conversationHistory = []) {
  // First run clinical keyword / symptom matching
  const match = analyzeTextSymptoms(userMessage);

  if (hasApiKey()) {
    try {
      const prompt = `You are FirstAid+ Smart Conversational Emergency Assistant.
User says: "${userMessage}".
Provide an empathetic, rapid, bulleted emergency first-aid triage response.
Format must follow this structure:
App: "Possible [injury name] detected."
Then display:
- Immediate action
- 2-4 clear bullet points
- What not to do (1-2 points)
- When to seek medical care
Followed by suggested quick triage follow-up question.
Keep response direct and concise for emergency situations.`;

      const aiResponse = await callGeminiApi(
        "gemini-2.5-flash",
        [{ parts: [{ text: prompt }] }]
      );
      
      return {
        detectedEmergency: match.title,
        severity: match.severity,
        guideId: match.id,
        reply: aiResponse.reply || aiResponse.response || JSON.stringify(aiResponse),
        structuredGuide: match
      };
    } catch (e) {
      // Fallback to local structured conversational formatting
    }
  }

  // Local structured conversational response matching Section 6
  let detectedTitle = match.possibleEmergency || match.title;
  let immediateSteps = match.immediateFirstAid.slice(0, 3);
  let harmfulActions = match.whatNotToDo.slice(0, 2);

  const formattedResponse = `**${detectedTitle} detected.**\n\n` +
    `**Immediate action:**\n` +
    immediateSteps.map(s => `• ${s}`).join('\n') + `\n\n` +
    `**What NOT to do:**\n` +
    harmfulActions.map(s => `• ${s}`).join('\n') + `\n\n` +
    `**Medical care:**\n` +
    `• ${match.whenToGetHelp}`;

  return {
    detectedEmergency: match.title,
    severity: match.severity,
    guideId: match.id,
    reply: formattedResponse,
    structuredGuide: match
  };
}

module.exports = {
  setApiKey,
  getApiKey,
  hasApiKey,
  analyzeText,
  analyzePhoto,
  processChatMessage
};

