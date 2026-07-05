"use server";

import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";

interface SavePrescriptionParams {
    imageUrl: string;
    rawText: string;
    parsedMedicines: any[];
    ocrConfidence: number;
}

export async function savePrescriptionRecord(params: SavePrescriptionParams) {
    try {
        const { imageUrl, rawText, parsedMedicines, ocrConfidence } = params;

        const { database } = await createAdminClient();

        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
        if (!databaseId) {
            throw new Error("Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID");
        }

        const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PRESCRIPTIONS || "prescriptions";

        const documentData = {
            imageUrl,
            rawText,
            parsedMedicines: JSON.stringify(parsedMedicines),
            ocrConfidence,
            createdAt: new Date().toISOString(),
            pharmacistReviewed: false,
            corrections: JSON.stringify({}),
        };

        const result = await database.createDocument(
            databaseId,
            collectionId,
            ID.unique(),
            documentData
        );

        return {
            success: true,
            documentId: result.$id
        };

    } catch (error: any) {
        console.error("Error saving prescription record:", error);
        return {
            success: false,
            error: error.message || "Failed to save prescription to database"
        };
    }
}
