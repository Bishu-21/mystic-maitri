export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite/server";

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    let secret = request.nextUrl.searchParams.get("secret");

    // Fallback: If secret is not in URL, try to find it in Appwrite's own cookies
    if (!secret) {
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
        const appwriteCookie = (await cookies()).get(`a_session_${projectId}`);
        if (appwriteCookie) {
            secret = appwriteCookie.value;
        }
    }

    if (!secret) {
        return NextResponse.redirect(new URL("/auth?error=invalid_oauth", request.url));
    }

    try {
        const { account } = await createAdminClient();
        // We don't necessarily even need to verify the session here if we trust the secret, 
        // but setting the cookie is what matters for our Server Components.

        (await cookies()).set("session", secret, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (error) {
        console.error("OAuth Callback Error:", error);
        return NextResponse.redirect(new URL("/auth?error=oauth_failed", request.url));
    }
}
