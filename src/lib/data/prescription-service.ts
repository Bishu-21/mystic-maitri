import { createAdminClient } from "@/lib/appwrite/server";
import { NormalizedMedicine } from "@/lib/validators/schemas";

export type { NormalizedMedicine };

export interface LatestPrescriptionResult {
    medicines: NormalizedMedicine[];
    metadata: {
        documentId: string;
        ocrAvgConfidence: number;
        createdAt: string;
        pharmacistReviewed: boolean;
    } | null;
}

export async function getLatestPrescription(): Promise<LatestPrescriptionResult> {
    try {
        const { database } = await createAdminClient();
        const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
        const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PRESCRIPTIONS || "prescriptions";

        if (!databaseId) {
            throw new Error("Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID");
        }

        // Fetch just the latest document
        const { documents } = await database.listDocuments(databaseId, collectionId, [
            // Appwrite uses Queries, but since we're using the base SDK we can pass simple queries
            // Query.orderDesc('$createdAt'),
            // Query.limit(1)
        ]);

        if (!documents || documents.length === 0) {
            return { medicines: [], metadata: null };
        }

        // Simulate orderDesc and limit(1) manually if queries aren't passed
        const sortedDocs = documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const latestDoc = sortedDocs[0];

        let parsedMeds: NormalizedMedicine[] = [];
        try {
            if (typeof latestDoc.parsedMedicines === "string") {
                parsedMeds = JSON.parse(latestDoc.parsedMedicines);
            } else if (Array.isArray(latestDoc.parsedMedicines)) {
                parsedMeds = latestDoc.parsedMedicines;
            }
        } catch (e) {
            console.error("Failed to parse medicines array", e);
        }

        // Calculate average OCR confidence for the specific prescription
        let avgConfidence = 0;
        if (parsedMeds.length > 0) {
            const confs = parsedMeds.map(m => m.confidence).filter(c => typeof c === 'number');
            avgConfidence = confs.length > 0 ? confs.reduce((a, b) => a + b, 0) / confs.length : (latestDoc.ocrConfidence || 0);
        } else {
            avgConfidence = latestDoc.ocrConfidence || 0;
        }

        return {
            medicines: parsedMeds,
            metadata: {
                documentId: latestDoc.$id,
                ocrAvgConfidence: Number(avgConfidence.toFixed(2)),
                createdAt: latestDoc.createdAt,
                pharmacistReviewed: latestDoc.pharmacistReviewed || false,
            }
        };

    } catch (error) {
        console.error("Failed to fetch latest prescription:", error);
        return { medicines: [], metadata: null };
    }
}
