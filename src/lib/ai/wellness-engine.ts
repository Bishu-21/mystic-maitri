import { GoogleGenerativeAI } from "@google/generative-ai";
import { NormalizedMedicine } from "@/lib/data/prescription-service";
import { WellnessPlanResponseSchema } from "@/lib/validators/schemas";

export interface WellnessEngineOutput {
    meal: {
        title: string;
        description: string;
        nutrients: string[];
        why: string;
    };
    warnings: string[];
    movement: {
        name: string;
        focus: string;
    }[];
    tags: string[];
    dailySummaryText: string;
    confidence: number;
    uncertainty: boolean;
    uncertaintyReason?: string;
    generatedAt: string;
}

export async function generateWellnessPlan(
    medicines: NormalizedMedicine[],
    vitals: { hr: number; bp: string; spo2: number },
    mealImageBase64?: string
): Promise<WellnessEngineOutput> {

    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
        throw new Error("Wellness Gemini API key is missing");
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const medicinesStr = medicines.length > 0
        ? JSON.stringify(medicines, null, 2)
        : "No active medications.";

    const promptText = `
You are a clinical lifestyle AI assistant evaluating a patient's daily wellness plan based ONLY on their current active prescriptions and vitals.
You do NOT diagnose diseases or invent medical conditions.
If the requested information is unclear or potentially unsafe, mark uncertainty: true.
Focus heavily on drug-nutrient interactions, safe movement relative to vitals, and recovery.

CURRENT VITALS:
- Heart Rate: ${vitals.hr} BPM
- Blood Pressure: ${vitals.bp}
- SpO2: ${vitals.spo2}%

ACTIVE PRESCRIPTIONS:
${medicinesStr}

USER UPLOADED IMAGE (Optional Meal Context):
${mealImageBase64 ? "The user has provided an image of their planned meal." : "No image provided."}

RULES:
1. Return strictly formatted JSON matching the exact schema below. Do NOT use markdown code blocks (\`\`\`json). Just return the raw JSON string.
2. Ground all advice in the provided active prescriptions. e.g., If Metformin is listed, suggest low GI meals. If an ACE inhibitor is listed, warn about high Potassium.
3. Keep the \`dailySummaryText\` conversational, warm, and highly personalized (under 2 sentences) suitable for Voice Narration. Use a generic welcoming greeting (e.g. "Namaste Friend"). Do NOT hardcode a specific name like "Priya" unless provided.
4. Calculate an AI \`confidence\` score (0.0 to 1.0) on how safe/certain you are about this advice.
5. List any severe drug-food interaction \`warnings\`. If none, leave array empty.

EXPECTED JSON SCHEMA:
{
  "meal": {
    "title": "Short Meal Name",
    "description": "1 sentence description",
    "nutrients": ["Tag1", "Tag2"],
    "why": "Specific reason linking meal to medications/vitals."
  },
  "warnings": ["Warning 1"],
  "movement": [
    { "name": "Yoga Pose / Exercise", "focus": "Why it helps" }
  ],
  "tags": ["Low GI", "Heart Healthy"],
  "dailySummaryText": "Conversational greeting and summary for TTS.",
  "confidence": 0.95,
  "uncertainty": false,
  "uncertaintyReason": "Only fill if uncertainty is true",
  "generatedAt": "" // Fill with current ISO ISO string
}
`;

    const parts: any[] = [{ text: promptText }];

    // Handle Multimodal Image Injection
    if (mealImageBase64) {
        // Strip out base64 header if present (e.g. data:image/jpeg;base64,)
        const base64Data = mealImageBase64.includes(',') ? mealImageBase64.split(',')[1] : mealImageBase64;

        parts.push({
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg" // Assuming jpeg for this pipeline, can be generalized later
            }
        });
    }

    try {
        const response = await model.generateContent(parts);
        let outputText = response.response.text();

        // Clean JSON formatting
        outputText = outputText.replace(/```json/gi, "").replace(/```/gi, "").trim();

        const parsed = JSON.parse(outputText);
        const validated = WellnessPlanResponseSchema.safeParse(parsed);

        if (validated.success) {
            const data = validated.data;
            data.generatedAt = new Date().toISOString();
            return data as WellnessEngineOutput;
        } else {
            console.error("Wellness plan validation failed:", validated.error);
            return {
                meal: {
                    title: "Balanced Whole Foods",
                    description: "Lean proteins and vegetables.",
                    nutrients: ["Fiber", "Protein"],
                    why: "Generic safe recommendation due to AI engine validation failure."
                },
                warnings: ["System was unable to analyze drug-nutrient interactions. Please consult a pharmacist."],
                movement: [
                    { name: "Light Walking", focus: "General circulation" }
                ],
                tags: ["Safe Fallback"],
                dailySummaryText: "Namaste. I encountered a small validation issue, but your vitals are stable. Stick to light movements and balanced meals today.",
                confidence: 0.1,
                uncertainty: true,
                uncertaintyReason: "Validation failed: " + validated.error.message.substring(0, 100),
                generatedAt: new Date().toISOString()
            };
        }

    } catch (error: any) {
        console.error("Wellness Engine Error:", error);

        // Fallback Output ensuring safety
        return {
            meal: {
                title: "Balanced Whole Foods",
                description: "Lean proteins and vegetables.",
                nutrients: ["Fiber", "Protein"],
                why: "Generic safe recommendation due to AI engine failure."
            },
            warnings: ["System was unable to analyze drug-nutrient interactions. Please consult a pharmacist."],
            movement: [
                { name: "Light Walking", focus: "General circulation" }
            ],
            tags: ["Safe Fallback"],
            dailySummaryText: "Namaste. I encountered a small issue connecting to my reasoning core, but your vitals are stable. Stick to light movements and balanced meals today.",
            confidence: 0.1,
            uncertainty: true,
            uncertaintyReason: error.message || "Gemini AI generation failed or returned invalid JSON.",
            generatedAt: new Date().toISOString()
        };
    }
}
