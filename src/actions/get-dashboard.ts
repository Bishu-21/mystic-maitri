"use server";

import { getDashboardData } from "@/lib/data/dashboard-service";

export async function fetchLiveDashboard() {
    try {
        const data = await getDashboardData();
        return { success: true, data };
    } catch (error: any) {
        console.error("Dashboard Fetch Error:", error);
        return { success: false, error: error.message || "Failed to load analytics" };
    }
}
