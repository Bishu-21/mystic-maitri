"use server";

import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrescriptionSchema } from "@/lib/validators/schemas";

const fallbackData = {
    medicines: [
        {
            name: "Unparsed Medicine",
            strength: "",
            dosage: "",
            frequency: "",
            duration: "",
            notes: "The AI system was unable to parse this prescription. Please review manually.",
            confidence: 0.0
        }
    ]
};

export async function analyzePrescription(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            throw new Error("No file uploaded");
        }

        // Convert the file to an ArrayBuffer and then to a Uint8Array
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Azure OCR Phase
        const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
        const apiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

        if (!endpoint || !apiKey) {
            throw new Error("Azure Document Intelligence credentials not found");
        }

        // Initialize DocumentAnalysisClient using the Azure Endpoint and AzureKeyCredential
        const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));

        // Call the prebuilt-read model, passing the image buffer
        const poller = await client.beginAnalyzeDocument("prebuilt-read", uint8Array);
        const result = await poller.pollUntilDone();

        // Extract and concatenate all the recognized text lines into a single rawText string
        let rawText = "";
        if (result.pages) {
            for (const page of result.pages) {
                if (page.lines) {
                    for (const line of page.lines) {
                        rawText += line.content + "\n";
                    }
                }
            }
        }

        if (!rawText.trim()) {
            throw new Error("No text could be extracted from the image");
        }

        // Gemini Structuring Phase
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) {
            throw new Error("Gemini API key not found");
        }

        // Initialize GoogleGenerativeAI using the Gemini API key
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Prompt requesting normalized schema
        const prompt = `You are an expert medical AI specializing in parsing messy handwritten prescriptions. Parse this raw OCR text extracted from a handwritten prescription: ${rawText}.
        
        Extract the medications and return ONLY a strict JSON object with a single root key "medicines", which contains an array of objects. Do NOT wrap the JSON in markdown blocks (like \`\`\`json).
        
        The objects in the "medicines" array must have the exact following shape:
        {
          "name": string,      // Name of the medication (do not invent names)
          "strength": string,  // e.g., "500mg", "10ml"
          "dosage": string,    // e.g., "1 tablet", "2 puffs"
          "frequency": string, // e.g., "twice a day", "every 8 hours"
          "duration": string,  // e.g., "5 days", "1 month"
          "notes": string,     // Any specific instructions like "after food", "before sleep"
          "confidence": number // Your confidence level from 0.0 to 1.0 (float) for this specific medication extraction
        }`;

        const aiResponse = await model.generateContent(prompt);
        let outputText = aiResponse.response.text();

        // Clean JSON string (remove markdown blocks if present)
        outputText = outputText.replace(/```json/gi, "").replace(/```/gi, "").trim();

        const parsedData = JSON.parse(outputText);
        const validated = PrescriptionSchema.safeParse(parsedData);

        if (validated.success) {
            return { success: true, data: validated.data };
        } else {
            console.error("Prescription validation failed:", validated.error);
            return { success: false, data: fallbackData, error: "Validation failed for parsed prescription." };
        }
    } catch (error: any) {
        console.error("Prescription analysis error:", error);
        return { success: false, data: fallbackData, error: error.message || "An unknown error occurred during parsing." };
    }
}
