"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/actions/auth";
import { signOut } from "@/lib/appwrite/api";

export default function DashboardHeader() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            try { await signOut(); } catch (e) { console.error("Client signout error", e); }
            await logout();
        } catch {
            // ignore
        } finally {
            router.push("/");
        }
    };

    return (
        <header className="w-full border-b border-carbon bg-paper/90 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-4 gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal">analytics</span>
                        <h1 className="font-sans text-sm font-black tracking-tight uppercase max-w-[200px] md:max-w-none text-carbon">
                            Maitri Clinical Portal
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6 font-mono text-[10px] md:text-xs w-full md:w-auto justify-between md:justify-end">
                    <button
                        onClick={handleLogout}
                        className="font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-carbon hover:text-paper transition-all border border-carbon px-4 py-1.5 bg-paper rounded ml-auto cursor-pointer"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    );
}
