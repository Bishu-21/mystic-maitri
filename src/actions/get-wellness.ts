"use server";

import { getLatestPrescription } from "@/lib/data/prescription-service";
import { generateWellnessPlan } from "@/lib/ai/wellness-engine";
import { generateTTS } from "@/lib/ai/tts";

export async function fetchWellnessIntelligence(mealImageBase64?: string) {
    try {
        // 1. Fetch live ground truth data
        const prescriptionData = await getLatestPrescription();

        // 2. Mock live Vitals payload (In a complete system, fetch from wearables DB)
        const mockVitals = {
            hr: 72,
            bp: "120/80",
            spo2: 98
        };

        // 3. Process through AI Engine
        const aiResponse = await generateWellnessPlan(
            prescriptionData.medicines,
            mockVitals,
            mealImageBase64
        );

        // 4. Generate TTS Narration
        const audioUrl = await generateTTS(aiResponse.dailySummaryText);

        return {
            success: true,
            data: {
                ai: aiResponse,
                context: {
                    vitals: mockVitals,
                    latestPrescriptionId: prescriptionData.metadata?.documentId,
                    medicinesCount: prescriptionData.medicines.length,
                    medicines: prescriptionData.medicines // Pass names to UI for context
                },
                audioUrl
            }
        };

    } catch (error: any) {
        console.error("Wellness Orchestrator Error:", error);
        return {
            success: false,
            error: error.message || "Failed to generate wellness intelligence."
        };
    }
}
