"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, User } from "lucide-react";
import { getCurrentUser } from "@/lib/appwrite/api";

export function Navbar() {
    const [user, setUser] = useState<Record<string, unknown> | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        };
        checkUser();
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
            <div className="glass-morphism w-full max-w-5xl rounded-full px-6 py-3 flex items-center justify-between border border-white/10 relative overflow-hidden">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group cursor-pointer z-10">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight group-hover:text-emerald-400 transition-colors">Medcify</span>
                </Link>

                {/* Links */}
                <div className="hidden md:flex items-center gap-8 z-10">
                    <Link href="#platform" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors">Platform</Link>
                    <Link href="#accuracy" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors">AI Accuracy</Link>
                    <Link href="#network" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors">Network</Link>
                    <Link href="#pricing" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors">B2B Pricing</Link>
                </div>

                {/* CTA */}
                <div className="z-10">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <button className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-white rounded-full group bg-gradient-to-br from-emerald-500 to-cyan-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-emerald-800 transition-all hover:scale-105 active:scale-95">
                                    <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-brand-background rounded-full group-hover:bg-opacity-0 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Dashboard
                                    </span>
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <Link href="/auth">
                            <button className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-white rounded-full group bg-gradient-to-br from-cyan-500 to-emerald-500 group-hover:from-cyan-500 group-hover:to-emerald-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-emerald-800 transition-all hover:scale-105 active:scale-95">
                                <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-brand-background rounded-full group-hover:bg-opacity-0">
                                    Partner Login
                                </span>
                            </button>
                        </Link>
                    )}
                </div>

                {/* Internal Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-shimmer"></div>
            </div>
        </nav>
    );
}
