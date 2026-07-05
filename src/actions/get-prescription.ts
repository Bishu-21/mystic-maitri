"use server";

import { createAdminClient } from "@/lib/appwrite/server";

export async function getPrescriptionRecord(documentId: string) {
    try {
        const { database } = await createAdminClient();
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

        if (!databaseId) {
            throw new Error("Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID");
        }

        const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PRESCRIPTIONS || "prescriptions";

        const doc = await database.getDocument(databaseId, collectionId, documentId);

        // Serialize to plain JSON object so Next.js can pass it to the Client Component
        const plainDoc = JSON.parse(JSON.stringify(doc));

        return { success: true, data: plainDoc };
    } catch (error: any) {
        console.error("Error fetching prescription record:", error);
        return { success: false, error: error.message || "Failed to fetch prescription record" };
    }
}
