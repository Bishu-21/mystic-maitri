"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/appwrite/api";

export function CTASection() {
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
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
            <div className="glass-morphism rounded-[3rem] p-12 lg:p-24 border border-white/10 relative overflow-hidden text-center">
                {/* Background accent */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>

                <h2 className="text-4xl lg:text-5xl font-bold text-slate-50 mb-8 relative z-10">
                    Ready to digitize your <span className="gradient-text">Supply Chain?</span>
                </h2>
                <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto relative z-10">
                    Join the network of 500+ rural pharmacies that have increased their fulfillment rates by 40% in the last 6 months.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
                    <Link href={authDestination}>
                        <button className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-brand-background font-bold rounded-2xl transition-all scale-100 hover:scale-105 shadow-lg shadow-emerald-500/20">
                            {user ? "Go to Dashboard" : "Get Started Today"}
                        </button>
                    </Link>
                    <Link href={authDestination}>
                        <button className="px-10 py-5 glass-morphism text-white font-bold rounded-2xl border border-white/10 hover:border-white/30 transition-all">
                            {user ? "View Analytics" : "Contact Sales"}
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
