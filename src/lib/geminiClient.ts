// ━━━ Gemini SDK Client Initialization ━━━
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error(
        "GEMINI_API_KEY is not set. Add it to your .env.local file."
    );
}

export const genAI = new GoogleGenAI({ apiKey });

// Model references
export const GEMINI_MODEL = "gemini-2.5-pro-preview-05-06";
export const GEMINI_FLASH = "gemini-2.0-flash";

export default genAI;
