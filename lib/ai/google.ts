import { GoogleGenerativeAI } from "@google/generative-ai";

// Verify API key is loaded
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.error("⚠️ GOOGLE_GENERATIVE_AI_API_KEY is not set!");
} else {
  console.log("✅ Google AI API Key is configured");
}

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
);

// Configure Google AI provider
export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
});

// Alternative: Use stable version
export const geminiFlashStable = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
});
