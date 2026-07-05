"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function askClinicalAssistant(query: string) {
    try {
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) throw new Error("Gemini API key not found");

        const genAI = new GoogleGenerativeAI(geminiKey);
        // Using gemma-4-26b-a4b-it as requested
        const model = genAI.getGenerativeModel({ model: "gemma-4-26b-a4b-it" });

        const prompt = `Act as a senior clinical assistant powered by Gemma 4. Provide concise, structured medical information for the following query.
        
        STRUCTURED_FORMAT:
        ### Condition / Concept
        (Brief 1-sentence analytical definition)
        
        ### Clinical Rationale / Pathophysiology
        • (Bullet point 1)
        • (Bullet point 2)
        
        ### Mandatory Diagnostic Alignment
        • (Required test 1)
        • (Required test 2)
        
        ### System Coordination Strategy
        • (Recommended specialty referral or workflow action)
        
        RULES:
        1. Keep it professional and strictly clinical.
        2. Do NOT provide personal medical advice or "I recommend" phrases. Use "Clinical protocols suggest..."
        3. No conversational filler.

        Query: "${query}"`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return {
            success: true,
            data: responseText
        };
    } catch (error: any) {
        console.error("Clinical Assistant Error:", error);
        return {
            success: false,
            error: error.message || "An error occurred."
        };
    }
}
