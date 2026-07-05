"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function parsePrescriptionWithGemini(rawText: string) {
    try {
        if (!rawText || !rawText.trim()) {
            throw new Error("No raw text provided for Gemini parsing.");
        }

        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) {
            throw new Error("Gemini API key not found");
        }

        // Initialize GoogleGenerativeAI using the Gemini API key
        const genAI = new GoogleGenerativeAI(geminiKey);
        // Use the gemini-2.5-flash model as requested
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are an expert medical AI specializing in parsing messy handwritten prescriptions from raw OCR text.

Your task is to parse the following raw OCR text:
"""
${rawText}
"""

RULES:
- Expand common medical abbreviations (e.g., "bd" -> "twice a day", "od" -> "once a day", "prn" -> "as needed").
- Normalize medicine names to their standard generic or common brand names if recognized, but do not change the core meaning.
- NEVER hallucinate unseen drugs. If a drug is not in the text, do not include it.
- Mark your uncertainty. If a field is illegible or unclear, output null or a clearly marked uncertainty (e.g. "?").
- Return ONLY a strict JSON object with a single root key "medicines", which contains an array of objects. Do NOT wrap the JSON in markdown blocks (like \`\`\`json).

The objects in the "medicines" array must have the exact following shape:
{
  "name": string,      // Name of the medication
  "strength": string,  // e.g., "500mg", "10ml"
  "dosage": string,    // e.g., "1 tablet", "2 puffs"
  "frequency": string, // e.g., "twice a day", "every 8 hours"
  "duration": string,  // e.g., "5 days", "1 month"
  "notes": string,     // Any specific instructions like "after food", "before sleep"
  "confidence": number // Your confidence level from 0.0 to 1.0 (float) for this specific medication extraction
}

Return raw JSON only.`;

        const aiResponse = await model.generateContent(prompt);
        let outputText = aiResponse.response.text();

        // Clean JSON string (remove markdown blocks if present)
        outputText = outputText.replace(/```json/gi, "").replace(/```/gi, "").trim();

        const parsedData = JSON.parse(outputText);

        if (!parsedData || !Array.isArray(parsedData.medicines)) {
            throw new Error("Invalid generic JSON structure returned from Gemini. Expected { medicines: [...] }");
        }

        return {
            success: true,
            data: parsedData
        };
    } catch (error: any) {
        console.error("Gemini parsing error:", error);
        return {
            success: false,
            error: error.message || "An unknown error occurred during Gemini parsing."
        };
    }
}
