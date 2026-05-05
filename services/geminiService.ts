import { GoogleGenAI } from "@google/genai";
import { indianLanguages } from '../constants';

// The API key must be obtained exclusively from the environment variable process.env.GEMINI_API_KEY.
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set.");
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return aiClient;
}

export const translateText = async (
  text: string,
  sourceLangCode: string,
  targetLangCode: string
): Promise<string> => {
  const sourceLangName = indianLanguages[sourceLangCode] || sourceLangCode;
  const targetLangName = indianLanguages[targetLangCode] || targetLangCode;
  
  const systemInstruction = `You are an expert, fluent language translator specializing in Indian languages. Translate the following text from ${sourceLangName} to ${targetLangName}. Only return the translated text without any explanation or conversational elements.`;
  const userQuery = `Translate: "${text}"`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const translatedText = response.text;
    if (translatedText) {
      return translatedText;
    } else {
      throw new Error("Empty response from API");
    }
  } catch (error) {
    console.error("Gemini API Translation Error:", error);
    throw error;
  }
};