"use server";

import { Client, Account, Databases, ID } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";

export async function signUpWithEmail(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    const govtId = formData.get("govtId") as string;
    const businessName = formData.get("businessName") as string;

    if (!name || !email || !password) {
        return { error: "Name, email, and password are required." };
    }

    try {
        // 1. Create the user in Appwrite Auth
        const { users, database } = await createAdminClient();
        const user = await users.create({
            userId: ID.unique(),
            email,
            password,
            name
        });

        // 2. Create a session for the new user using the Admin Client
        const { account: adminAccount } = await createAdminClient();
        const session = await adminAccount.createEmailPasswordSession(email, password);

        (await cookies()).set("session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        // Prefill phone with +91 if not already
        const formattedPhone = phone ? (phone.startsWith("+91") ? phone : `+91${phone}`) : "";

        // 3. Create User Profile in database
        try {
            const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
            const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES || "profiles";

            await database.createDocument(
                databaseId,
                collectionId,
                user.$id,
                {
                    userId: user.$id,
                    name,
                    email,
                    phone: formattedPhone,
                    govtId,
                    businessName,
                }
            );
        } catch (dbError: unknown) {
            console.error("Database Profile Error:", dbError);
            if (dbError && typeof dbError === 'object' && 'code' in dbError && (dbError as { code: number }).code === 409) {
                return { error: "This Government ID or Business is already registered." };
            }
            return { error: "Failed to create profile. Please contact support." };
        }

        return { success: true };

    } catch (error: unknown) {
        console.error("SignUp Error:", error);
        if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 409) {
            return { error: "A user with this email or phone already exists." };
        }
        return { error: (error instanceof Error ? error.message : "Registration failed. Please try again.") };
    }
}

export async function signInWithEmail(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required." };
    }

    try {
        const { account } = await createAdminClient();
        const session = await account.createEmailPasswordSession(email, password);

        (await cookies()).set("session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return { success: true };

    } catch (error: unknown) {
        console.error("SignIn Error:", error);
        if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 401) {
            return { error: "Invalid email or password. Please try again." };
        }
        return { error: (error instanceof Error ? error.message : "Authentication failed.") };
    }
}

export async function sendPhoneOtp(phone: string) {
    // Enforce 10 digit, prepend +91
    const cleanPhone = phone.replace(/\D/g, '').slice(0, 10);
    if (cleanPhone.length !== 10) {
        return { error: "Please enter a valid 10-digit Indian mobile number." };
    }
    const formattedPhone = `+91${cleanPhone}`;

    try {
        const { users } = await createAdminClient();

        // Check if user exists
        const existingUsers = await users.list();
        const existingUser = existingUsers.users.find(
            (u: { phone: string }) => u.phone === formattedPhone
        );

        if (!existingUser) {
            return {
                error: "No account found with this phone number. Please Sign Up first.",
                shouldSignUp: true
            };
        }

        const userId = existingUser.$id;

        // Create phone token using a public client (no API key)
        const publicClient = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
        const publicAccount = new Account(publicClient);
        const token = await publicAccount.createPhoneToken(userId, formattedPhone);

        return { success: true, userId: token.userId };
    } catch (error: unknown) {
        console.error("Send OTP Error:", error);
        return { error: (error instanceof Error ? error.message : "Failed to send OTP.") };
    }
}

export async function verifyPhoneOtp(userId: string, secret: string) {
    try {
        const publicClient = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

        const publicAccount = new Account(publicClient);
        const session = await publicAccount.createSession(userId, secret);

        (await cookies()).set("session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        return { success: true };
    } catch (error: unknown) {
        console.error("Verify OTP Error:", error);
        return { error: "Invalid code. Please try again." };
    }
}

export async function getLoggedInUser() {
    try {
        const session = (await cookies()).get("session");
        if (!session || !session.value) {
            return null;
        }

        const { account } = await createSessionClient(session.value);
        return await account.get();
    } catch (error) {
        // Handle Next.js dynamic server usage error (thrown during static build/pre-rendering)
        if (error && typeof error === 'object' && 'digest' in error && error.digest === 'DYNAMIC_SERVER_USAGE') {
            throw error;
        }
        console.error("Get User Error:", error);
        return null;
    }
}

export async function logout() {
    try {
        const session = (await cookies()).get("session");
        if (session && session.value) {
            const { account } = await createSessionClient(session.value);
            await account.deleteSession("current");
        }
    } catch (error) {
        console.error("Logout Error:", error);
    } finally {
        (await cookies()).delete("session");
        redirect("/");
    }
}
