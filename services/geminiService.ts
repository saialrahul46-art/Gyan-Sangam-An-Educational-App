import { GoogleGenAI } from "@google/genai";
import { indianLanguages } from '../constants';

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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