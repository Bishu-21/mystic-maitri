import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/actions/auth";
import DashboardHeader from "@/app/dashboard/DashboardHeader";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Fetch user on the SERVER before sending ANY HTML to the client
    const user = await getLoggedInUser();

    // 2. If no user, strictly bounce them
    if (!user) {
        redirect("/auth");
    }

    // 3. Render Dashboard with the user validated
    return (
        <div className="bg-paper font-display text-carbon min-h-screen">
            <div className="bg-grid min-h-screen flex flex-col relative">

                {/* Extracted Client Header (so Logout works) */}
                <DashboardHeader />

                {/* Main Content */}
                <main className="flex-grow container mx-auto px-4 md:px-6 py-8 md:py-12 pb-12">
                    {children}
                </main>
            </div>
        </div>
    );
}
