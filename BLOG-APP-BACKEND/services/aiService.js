import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is missing. AI summaries will run in mock mode.");
}

export const generateBlogSummary = async (content) => {
  if (!content || content.trim().length < 20) {
    throw new Error("Content is too short or empty to summarize.");
  }

  // Fallback / mock mode if API key is not present so the platform remains fully operational
  if (!genAI) {
    console.log("AI Summary running in Mock Editorial Mode...");
    const dummyWords = content.split(" ").slice(0, 30).join(" ");
    return {
      summary: `This insightful dispatch analyzes and explores key topics surrounding: ${dummyWords}... It details crucial structural concepts, editorial methodologies, and systemic approaches.`,
      previewText: `Exploring: ${dummyWords.slice(0, 80)}...`,
      tags: ["editorial", "insights", "writing"],
      seoDescription: `An in-depth Editora dispatch discussing "${dummyWords.slice(0, 60)}..." and its broader cultural impact.`
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const prompt = `You are a professional senior editor at "Editora" — a premium magazine platform like Apple News and Substack.
Analyze the following blog content and output a JSON object containing a premium summary, teaser preview, tags, and an SEO description.

Return exactly this JSON format, with no markdown styling wrappers or commentary outside of the JSON:
{
  "summary": "An elegant 2-3 sentence editorial summary of the article.",
  "previewText": "A punchy, single-sentence hook suitable for blog grids (under 140 characters).",
  "tags": ["tag1", "tag2", "tag3"],
  "seoDescription": "A search-engine optimized description under 155 characters."
}

Blog Content:
${content}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the structured JSON response
    const parsedData = JSON.parse(responseText);
    
    // Validate schema keys
    return {
      summary: parsedData.summary || "Summary generation completed.",
      previewText: parsedData.previewText || "Teaser preview available.",
      tags: Array.isArray(parsedData.tags) ? parsedData.tags.map(t => t.toLowerCase()) : ["editorial"],
      seoDescription: parsedData.seoDescription || "Read the latest Editora dispatch."
    };
  } catch (err) {
    console.error("Gemini AI service error:", err);
    throw new Error("AI Summary Generation failed: " + err.message);
  }
};
