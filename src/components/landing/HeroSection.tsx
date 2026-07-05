"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getCurrentUser } from "@/lib/appwrite/api";

export function HeroSection() {
    const [user, setUser] = useState<Record<string, unknown> | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        };
        checkUser();
    }, []);

    const authDestination = user ? "/dashboard" : "/auth";

    return (
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32" id="hero">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left Content */}
                <div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6 animate-fade-in-up">
                        <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Next-Gen Supply Chain OS
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold text-slate-50 leading-[1.1] mb-6 animate-fade-in-up delay-100">
                        Predictive Inventory for <span className="gradient-text">Every Village.</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl animate-fade-in-up delay-200">
                        The AI operating system for rural pharmacies. Eliminate stockouts, automate prescriptions via OCR, and connect to the local health network.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                        <Link href={authDestination}>
                            <button className="px-8 py-4 bg-white text-brand-background font-bold rounded-xl hover:bg-slate-200 transition-all shadow-xl shadow-white/5 w-full sm:w-auto">
                                {user ? "Go to Dashboard" : "Book a Demo"}
                            </button>
                        </Link>
                        <Link href={authDestination}>
                            <button className="px-8 py-4 glass-morphism text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all w-full sm:w-auto">
                                Explore Platform
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Right Visual: Isometric Mockup */}
                <div className="relative flex justify-center lg:justify-end perspective-1000 group">
                    <div className="isometric-mockup glass-morphism p-6 rounded-2xl border border-white/10 w-full max-w-lg aspect-[4/3] flex flex-col relative z-10 transition-transform duration-500 group-hover:rotate-y-[-5deg] group-hover:rotate-x-[5deg]">

                        {/* Window Controls */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">live_inventory_feed_v2.0</div>
                        </div>

                        {/* Chart Content */}
                        <h3 className="text-slate-50 text-lg font-semibold mb-6">Demand Forecast</h3>
                        <div className="flex-grow flex items-end gap-3 pb-4">
                            <div className="w-full bg-emerald-500/20 rounded-t-md h-[40%] relative group/bar transition-all duration-500 hover:bg-emerald-500/30">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[10px] text-black px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity font-bold">42%</div>
                            </div>
                            <div className="w-full bg-emerald-500/40 rounded-t-md h-[60%] relative group/bar transition-all duration-500 hover:bg-emerald-500/50">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[10px] text-black px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity font-bold">58%</div>
                            </div>
                            <div className="w-full bg-cyan-500/60 rounded-t-md h-[90%] relative group/bar transition-all duration-500 hover:bg-cyan-500/70">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[10px] text-black px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity font-bold">89%</div>
                            </div>
                            <div className="w-full bg-emerald-500/40 rounded-t-md h-[55%] relative group/bar transition-all duration-500 hover:bg-emerald-500/50">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[10px] text-black px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity font-bold">52%</div>
                            </div>
                            <div className="w-full bg-emerald-500/20 rounded-t-md h-[30%] relative group/bar transition-all duration-500 hover:bg-emerald-500/30">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[10px] text-black px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity font-bold">28%</div>
                            </div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5 font-mono">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                        </div>
                    </div>

                    {/* Decorative Glow */}
                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/20 blur-[100px] rounded-full animate-pulse-slow"></div>
                </div>
            </div>
        </section>
    );
}
