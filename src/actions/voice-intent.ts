"use server";

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { getCachedResult, setCachedResult, hashNormalizedContent } from "@/lib/cache/redis";
import { addToWorkflow } from "@/actions/workflow";
import { VoiceIntentResponseSchema, WorkflowItemSchema } from "@/lib/validators/schemas";
import type { VoiceIntentResponse } from "@/lib/validators/schemas";

const fallbackVoiceIntent: VoiceIntentResponse = {
    intent: "Voice Logged",
    specialty: "General Medicine",
    priority: "NORMAL",
    confidence: 0.5,
    summary: "Voice note recorded. Automated clinical intent extraction was inconclusive.",
    instructions: "Please manually review the audio recording/transcript and input actions.",
    language: "en",
    languageName: "English",
    suggested_action: "Review transcript manually",
    verbal_response: "Voice log captured. Intent was inconclusive, routing to manual review."
};

export async function parseVoiceIntentWithGemini(rawText: string) {
    const geminiKey = process.env.GEMINI_API_KEY;
    const cacheKey = rawText ? hashNormalizedContent("voice-intent", rawText, "v1") : "";

    let parsedData: VoiceIntentResponse = fallbackVoiceIntent;
    let cacheStatus = "MISS";
    let isSuccess = false;

    try {
        if (!rawText || !rawText.trim()) {
            throw new Error("No transcription provided.");
        }

        if (!geminiKey) {
            throw new Error("Gemini API key not found");
        }

        // ⚡ NORMALIZED CACHE CHECK
        const cached = await getCachedResult<any>(cacheKey);

        if (cached) {
            console.log("[CACHE_HIT] // NEURAL_CORE_BYPASS");
            const validated = VoiceIntentResponseSchema.safeParse(cached);
            if (validated.success) {
                parsedData = validated.data;
                cacheStatus = "HIT";
                isSuccess = true;
            } else {
                console.warn("[CACHE_INVALID] Cached voice intent failed schema validation.");
            }
        }

        if (!isSuccess && cacheStatus === "MISS") {
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

            const prompt = `Act as a multilingual medical scribe. The following clinical transcript may be in English, Hindi, or Bengali.
            
            Your task:
            1. Detect the source language.
            2. Extract operational intent, specialty, and priority.
            3. Provide a 'summary' and 'instructions' specifically for the patient.
            
            CRITICAL BENGALI/HINDI RULES:
            - If the input is in Bengali, the 'summary' and 'instructions' MUST be in high-quality Bengali native script. 
            - Use accurate medical terminology that remains accessible to patients.
            - The JSON keys MUST be in English.
            - The values for 'summary' and 'instructions' MUST be in the EXACT SAME language as the source input.
            - Include the detected language (e.g., "en", "hi", "bn") in the 'language' field.
            - provide a 'suggested_action' field: Based on the intent (e.g., referral, medicine change, urgent triage), what is the ONE immediate clinical next step?
            - provide a 'verbal_response' field: A concise, conversational response (10-15 words) that the AI will SAY back to the clinician. (e.g., "Understood. I've drafted a pulmonology referral for Room 302. Should I add it to the queue?")
            - Ensure the verbal_response is also in the same language as the input (Bengali/Hindi/English).

            Transcript:
            "${rawText}"`;

            const responseSchema = {
                type: SchemaType.OBJECT,
                properties: {
                    intent: { type: SchemaType.STRING },
                    specialty: { type: SchemaType.STRING },
                    priority: { type: SchemaType.STRING },
                    confidence: { type: SchemaType.NUMBER },
                    summary: { type: SchemaType.STRING },
                    instructions: { type: SchemaType.STRING },
                    language: { type: SchemaType.STRING },
                    languageName: { type: SchemaType.STRING },
                    suggested_action: { type: SchemaType.STRING },
                    verbal_response: { type: SchemaType.STRING }
                },
                required: ["intent", "specialty", "priority", "confidence", "summary", "language", "suggested_action", "verbal_response"]
            };

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    // @ts-ignore
                    responseSchema: responseSchema as any,
                },
            });

            const outputText = result.response.text();
            const rawJson = JSON.parse(outputText);
            const validated = VoiceIntentResponseSchema.safeParse(rawJson);

            if (validated.success) {
                parsedData = validated.data;
                isSuccess = true;
                // 🧬 UPDATE CACHE
                await setCachedResult(cacheKey, parsedData, 86400); // 24h TTL
            } else {
                console.error("Voice intent validation failed:", validated.error);
                throw new Error("Validation failed for voice intent.");
            }
        }
    } catch (error: any) {
        console.error("Gemini Intent Extraction error (using fallback):", error);
        parsedData = fallbackVoiceIntent;
        isSuccess = false;
    }

    // 🧬 ALWAYS AUTO-PUSH TO WORKFLOW QUEUE (Even on cache hits and failures)
    const workflowItem = {
        id: `VC-${Date.now()}`,
        source: "voice" as const,
        title: parsedData.intent,
        description: parsedData.summary,
        confidence: parsedData.confidence,
        priority: parsedData.priority,
        status: "PENDING" as const,
        createdAt: Date.now(),
        reasoning: parsedData.suggested_action,
        data: parsedData
    };

    const validatedWorkflow = WorkflowItemSchema.safeParse(workflowItem);
    if (validatedWorkflow.success) {
        await addToWorkflow(validatedWorkflow.data);
    } else {
        console.error("Workflow item validation failed, using absolute safe fallback push:", validatedWorkflow.error);
        await addToWorkflow({
            id: `VC-${Date.now()}`,
            source: "voice",
            title: fallbackVoiceIntent.intent,
            description: fallbackVoiceIntent.summary,
            confidence: fallbackVoiceIntent.confidence,
            priority: "NORMAL",
            status: "PENDING",
            createdAt: Date.now(),
            reasoning: fallbackVoiceIntent.suggested_action,
            data: fallbackVoiceIntent
        });
    }

    if (isSuccess) {
        return {
            success: true,
            data: parsedData,
            cacheStatus
        };
    } else {
        return {
            success: false,
            data: parsedData,
            error: "Failed to parse voice intent. Returned fallback data.",
            cacheStatus: "MISS"
        };
    }
}
