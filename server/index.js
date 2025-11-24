import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini
// Note: Ensure process.env.API_KEY is set in your .env file
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.use(cors());
app.use(express.json());

// --- Routes ---

/**
 * Generate Social Media Insights
 */
app.post('/api/insights', async (req, res) => {
  try {
    const { industry, timezone } = req.body;
    
    if (!industry || !timezone) {
      return res.status(400).json({ error: "Missing industry or timezone" });
    }

    const now = new Date();
    // Adjust time to the user's timezone if possible, or use server time labeled with timezone
    const day = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone });
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: timezone });

    const prompt = `
      You are a world-class social media strategist.
      Current Context:
      - Industry/Niche: ${industry}
      - Current Day: ${day}
      - Current Time: ${time}
      - Timezone: ${timezone}

      Task:
      Analyze real-time engagement patterns for the following platforms: Instagram, Twitter (X), LinkedIn, TikTok, and YouTube Shorts.
      Provide a forecast for the next 12 hours.
      Determine the 'currentStatus' (Excellent, Good, Fair, Poor) for posting RIGHT NOW.
      Provide the 'nextBestSlot' (e.g. 'Today 4:30 PM') if now is not ideal.
      Give a 'viralityScore' (0-100) representing the potential reach if posted now.
      Provide a short 'reasoning' (max 1 sentence).
      Provide an 'hourlyForecast' array for the next 6 hours with a score (0-100) for engagement potential.
      Provide a 'generalAdvice' summary for the user.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            generalAdvice: { type: Type.STRING },
            platforms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  currentStatus: { type: Type.STRING, enum: ["Excellent", "Good", "Fair", "Poor"] },
                  nextBestSlot: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                  viralityScore: { type: Type.INTEGER },
                  hourlyForecast: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        hour: { type: Type.STRING },
                        score: { type: Type.INTEGER }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data received from Gemini");

    res.json(JSON.parse(jsonText));

  } catch (error) {
    console.error("Error in /api/insights:", error);
    res.status(500).json({ error: "Failed to fetch insights" });
  }
});

/**
 * Generate Trending Topics
 */
app.post('/api/trending', async (req, res) => {
  try {
    const { industry } = req.body;
    
    if (!industry) {
      return res.status(400).json({ error: "Missing industry" });
    }

    const prompt = `
      Find 5 currently trending topics, news stories, or viral conversations relevant to the '${industry}' industry.
      Use Google Search to get real-time data.
      
      For each topic, provide:
      1. The Topic Name
      2. A brief description (why it is trending)
      3. 3-5 relevant hashtags (e.g. #Example)
      4. 3-5 short-term keywords for SEO
      
      Format the output strictly as a structured list using these prefixes for each item:
      TREND: [Topic Name]
      DESC: [Description]
      TAGS: [comma separated hashtags]
      KEYS: [comma separated keywords]
      
      Example:
      TREND: Artificial Intelligence
      DESC: New models are breaking benchmarks.
      TAGS: #AI, #TechTrends, #MachineLearning
      KEYS: LLM, generative ai, tech news
      
      Do not use bolding (**) or other markdown. Keep it plain text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "";
    
    // Parse the structured text response
    const items = [];
    const lines = text.split('\n');
    let currentItem = {};

    for (const line of lines) {
      const l = line.trim();
      
      if (l.startsWith('TREND:')) {
        if (currentItem.topic) {
          items.push(currentItem);
        }
        currentItem = { 
          topic: l.substring(6).trim(), 
          description: "", 
          hashtags: [], 
          keywords: [] 
        };
      } else if (l.startsWith('DESC:') && currentItem.topic) {
        currentItem.description = l.substring(5).trim();
      } else if (l.startsWith('TAGS:') && currentItem.topic) {
        currentItem.hashtags = l.substring(5).split(',').map(s => s.trim()).filter(s => s);
      } else if (l.startsWith('KEYS:') && currentItem.topic) {
        currentItem.keywords = l.substring(5).split(',').map(s => s.trim()).filter(s => s);
      }
    }
    
    if (currentItem.topic) {
      items.push(currentItem);
    }

    // Extract grounding metadata for sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map(chunk => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter(s => s !== null);

    res.json({
      items,
      rawText: text,
      sources
    });

  } catch (error) {
    console.error("Error in /api/trending:", error);
    res.status(500).json({ error: "Failed to fetch trending topics" });
  }
});

// --- Static Files (Production) ---
// Serve static files from the React app build directory
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all handler for any request that doesn't match an API route
// Returns the React app's index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});