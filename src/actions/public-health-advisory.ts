"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateOutbreakAdvisory(
    zipCode: string,
    anomalyType: string,
    cases: number,
    lang: string
) {
    try {
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) throw new Error("Gemini API key not found");

        const genAI = new GoogleGenerativeAI(geminiKey);
        // Using gemma-4-26b-a4b-it as requested
        const model = genAI.getGenerativeModel({ model: "gemma-4-26b-a4b-it" });

        // Map ZIP to local neighborhood name for extra authenticity
        const neighborhoodMap: Record<string, string> = {
            "700015": "Beliaghata / Tangra",
            "700091": "Salt Lake / Sector V",
            "700016": "Park Street / Mullick Bazar",
            "700009": "Rajabazar / Amherst Street",
            "700020": "Bhowanipore / Elgin Road"
        };
        const neighborhood = neighborhoodMap[zipCode] || `Kolkata Zone (ZIP: ${zipCode})`;

        const prompt = `Act as an expert Public Health Epidemiological Officer for the Kolkata Municipal Corporation (KMC) powered by Gemma 4.
        Provide a highly localized, actionable public health outbreak advisory based on the following epidemiological signal:
        
        - Neighborhood: ${neighborhood} (ZIP Code: ${zipCode})
        - Detected Surge Anomaly: ${anomalyType}
        - Current Active Cases registered in loop: ${cases}
        - Output Language: ${lang === "bn" ? "Bengali (বাংলা হরফে)" : lang === "hi" ? "Hindi (हिंदी लिपि)" : "English"}

        CRITICAL LOCALIZED RULES:
        1. Keep the advisory strictly concise (3-4 bullet points maximum).
        2. The output MUST be in high-quality native script of the selected language (${lang}).
        3. Ground advice in local cultural/geographical norms (e.g. for Dengue/Fever, suggest drinking coconut water / "Daab-er Jol" (ডাবের জল) or fresh juices, avoiding water accumulation in neighborhood flower pots/drains, and visiting the nearest Ward Health Unit).
        4. Do NOT use generic conversational fillers. Start directly with the localized advisory text.
        5. Structure the advice with clean markdown bullet points (•).
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return {
            success: true,
            data: responseText,
            neighborhood
        };
    } catch (error: any) {
        console.error("Public Health Advisor Error:", error);
        return {
            success: false,
            error: error.message || "An error occurred generating the public health advisory."
        };
    }
}
