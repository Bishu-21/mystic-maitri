"use server";

import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";
import { createAdminClient } from "@/lib/appwrite/server";

// Keep it strictly Node.js runtime for Appwrite + Azure SDKs

export async function runAzureOCR(fileId: string) {
    let attempt = 0;
    const maxRetries = 1;

    while (attempt <= maxRetries) {
        try {
            if (!fileId) {
                throw new Error("No fileId provided");
            }

            // 1. Fetch file from Appwrite Storage
            const { storage } = await createAdminClient();
            const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

            // getFileDownload returns an ArrayBuffer
            const fileBuffer = await storage.getFileDownload(bucketId, fileId);
            const uint8Array = new Uint8Array(fileBuffer);

            // 2. Initialize Azure Client
            const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
            const apiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

            if (!endpoint || !apiKey) {
                throw new Error("Azure Document Intelligence credentials not found");
            }

            const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));

            // 3. Call Azure prebuilt-read
            const poller = await client.beginAnalyzeDocument("prebuilt-read", uint8Array);
            const result = await poller.pollUntilDone();

            // 4. Extract rawText and calculate average confidence
            let rawText = "";
            let totalConfidence = 0;
            let wordCount = 0;

            if (result.pages) {
                for (const page of result.pages) {
                    if (page.lines) {
                        for (const line of page.lines) {
                            rawText += line.content + "\n";
                        }
                    }
                    if (page.words) {
                        for (const word of page.words) {
                            if (word.confidence !== undefined) {
                                totalConfidence += word.confidence;
                                wordCount++;
                            }
                        }
                    }
                }
            }

            if (!rawText.trim()) {
                throw new Error("No text could be extracted from the image");
            }

            // Calculate average confidence as a float (0.0 to 1.0)
            const ocrConfidence = wordCount > 0 ? totalConfidence / wordCount : 0;

            // Return successful extraction
            return {
                success: true,
                rawText: rawText.trim(),
                ocrConfidence: Number(ocrConfidence.toFixed(4)) // Round to 4 decimal places
            };

        } catch (error: any) {
            console.error(`Azure OCR Attempt ${attempt + 1} failed:`, error);

            if (attempt >= maxRetries) {
                return {
                    success: false,
                    error: error.message || "An unknown error occurred during Azure OCR extraction."
                };
            }
            // Retry will happen on next loop iteration
            attempt++;
        }
    }

    return {
        success: false,
        error: "Max retries exceeded."
    };
}
