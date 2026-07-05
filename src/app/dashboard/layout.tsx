import DashboardHeader from "@/app/dashboard/DashboardHeader";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
