"use server";

import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { createAdminClient } from "@/lib/appwrite/server";

export async function uploadPrescriptionImage(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            throw new Error("No file uploaded");
        }

        // Validate type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
        if (!validTypes.includes(file.type)) {
            throw new Error("Invalid file type. Only JPEG, PNG, WEBP, GIF, and PDF are allowed.");
        }

        // Validate size (max 5MB)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            throw new Error("File size exceeds the 5MB limit.");
        }

        const { storage } = await createAdminClient();

        const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
        const fileId = ID.unique();

        // Convert file to InputFile for node-appwrite
        const buffer = Buffer.from(await file.arrayBuffer());
        const inputFile = InputFile.fromBuffer(buffer, file.name || "prescription-upload");

        const uploadedFile = await storage.createFile({
            bucketId,
            fileId,
            file: inputFile,
        });

        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

        if (!projectId) {
            throw new Error("Appwrite project ID not found in environment variables.");
        }

        // Generate a standard Appwrite view URL
        const imageUrl = `${endpoint}/storage/buckets/${bucketId}/files/${uploadedFile.$id}/view?project=${projectId}`;

        return {
            success: true,
            fileId: uploadedFile.$id,
            imageUrl: imageUrl
        };
    } catch (error: any) {
        console.error("Prescription upload error:", error);
        return {
            success: false,
            error: error.message || "An unknown error occurred during image upload."
        };
    }
}
