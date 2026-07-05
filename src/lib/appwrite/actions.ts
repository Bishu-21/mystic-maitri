"use server";

import { createAdminClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

export async function getUserIdByEmail(email: string) {
    try {
        console.log("Server Action: createAdminClient...");
        const { users } = await createAdminClient();
        console.log("Server Action: Listing users with email query...");
        const result = await users.list([Query.equal("email", email)]);
        console.log("Server Action Result Total:", result.total);
        if (result.total > 0) {
            return result.users[0].$id;
        }
    } catch (error) {
        console.error("Error fetching user by email:", error);
    }
    return null;
}
