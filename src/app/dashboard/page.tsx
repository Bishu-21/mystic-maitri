"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWorkflowCount } from "@/actions/workflow";
import VoiceAgent from "@/components/dashboard/VoiceAgent";
import ClinicalAssistant from "@/components/dashboard/ClinicalAssistant";


export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [workflowCount, setWorkflowCount] = useState(0);
    const [signalAlerts, setSignalAlerts] = useState(3);

    useEffect(() => {
        // Simulate initial system bootup/sync
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);

        const fetchMetrics = async () => {
            const count = await getWorkflowCount();
            setWorkflowCount(count);
            setSignalAlerts(prev => Math.max(1, prev + (Math.random() > 0.9 ? 1 : Math.random() > 0.9 ? -1 : 0)));
        };
        fetchMetrics();
        const metricsInterval = setInterval(fetchMetrics, 3000);

        return () => {
            clearTimeout(timer);
            clearInterval(metricsInterval);
        };
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4 text-carbon">
                    <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
                    <p className="font-mono tracking-widest text-sm uppercase">INITIALIZING NEURAL CORE...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in grid grid-cols-12 gap-6 lg:gap-12">
            {/* Section A: Left 8 Columns */}
            <section className="col-span-12 lg:col-span-8 flex flex-col gap-12">
                <div className="flex flex-col gap-6">
                    <h2 className="font-sans font-black text-4xl md:text-6xl tracking-tight text-carbon uppercase">
                        {workflowCount > 0 ? "AI Action Proposed" : "Awaiting Clinical Input"}
                    </h2>
                    <p className="font-mono text-sm max-w-xl leading-relaxed text-gray-600 uppercase tracking-wide">
                        {workflowCount > 0 ? "Awaiting human authorization for proposed clinical adjustments." : "Maitri Clinic captures voice, documents, and operational signals. All system actions require human authorization."}
                    </p>
                </div>

                {/* Statistics Panel */}
                <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-carbon bg-paper">
                    <div className="p-4 md:p-6 border-r border-b border-carbon">
                        <p className="font-mono text-[10px] text-gray-500 mb-2">VOICE SESSIONS TODAY</p>
                        <p className="text-3xl md:text-4xl font-black tracking-tighter">8</p>
                    </div>
                    <div className="p-4 md:p-6 border-r border-b border-carbon">
                        <p className="font-mono text-[10px] text-gray-500 mb-2">DOCUMENTS PROCESSED</p>
                        <p className="text-3xl md:text-4xl font-black tracking-tighter">27</p>
                    </div>
                    <div className="p-4 md:p-6 border-r border-b border-carbon">
                        <p className="font-mono text-[10px] text-gray-500 mb-2">PENDING ACTIONS</p>
                        <p className="text-3xl md:text-4xl font-black tracking-tighter text-teal">{workflowCount}</p>
                    </div>
                    <div className="p-4 md:p-6 border-r border-b border-carbon">
                        <p className="font-mono text-[10px] text-gray-500 mb-2">SIGNAL ALERTS</p>
                        <p className="text-3xl md:text-4xl font-black tracking-tighter">{signalAlerts}</p>
                    </div>
                </div>

                {/* 🧬 LIVE AI SERVICES LAYER */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
                    {/* Primary: Voice Agent */}
                    <div className="col-span-1">
                        <VoiceAgent />
                    </div>

                    {/* Secondary: Clinical Assistant */}
                    <div className="col-span-1">
                        <ClinicalAssistant />
                    </div>
                </div>
            </section>

            {/* Section B: Right 4 Columns */}
            <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                {/* Card 1 */}
                <Link href="/dashboard/voice" className="block border border-carbon p-6 md:p-8 bg-paper transition-all cursor-pointer group hover:bg-carbon/5">
                    <div className="flex justify-between items-start mb-6">
                        <span className="material-symbols-outlined text-3xl text-teal">mic</span>
                        <span className="font-mono text-[10px] border border-carbon px-2 py-1">Module 1</span>
                    </div>
                    <h3 className="font-sans font-black text-lg mb-4 tracking-tight uppercase text-carbon">Voice Core</h3>
                    <p className="font-sans text-sm leading-relaxed text-gray-600">
                        Capture clinical dictation and extract structured patient records in real-time.
                    </p>
                    <div className="mt-8 border-t border-carbon pt-4 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-teal"></div>
                        <span className="font-mono text-[10px] uppercase">Active</span>
                    </div>
                </Link>

                {/* Card 2 */}
                <Link href="/dashboard/document" className="block border border-carbon p-6 md:p-8 bg-carbon text-paper transition-all cursor-pointer shadow-none hover:bg-carbon/90">
                    <div className="flex justify-between items-start mb-6">
                        <span className="material-symbols-outlined text-3xl text-teal">description</span>
                        <span className="font-mono text-[10px] border border-paper/20 px-2 py-1">Module 2</span>
                    </div>
                    <h3 className="font-sans font-black text-lg mb-4 tracking-tight uppercase text-paper">Document Engine</h3>
                    <p className="font-sans text-sm leading-relaxed opacity-80">
                        Extract structured clinical JSON from scanned prescriptions and medical notes.
                    </p>
                    <div className="mt-8 border-t border-paper/10 pt-4 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-teal"></div>
                        <span className="font-mono text-[10px] uppercase">Active</span>
                    </div>
                </Link>

                {/* Card 3 */}
                <Link href="/dashboard/signals" className="block border border-carbon p-6 md:p-8 bg-paper transition-all cursor-pointer group hover:bg-carbon/5">
                    <div className="flex justify-between items-start mb-6">
                        <span className="material-symbols-outlined text-3xl text-teal">hub</span>
                        <span className="font-mono text-[10px] border border-carbon px-2 py-1">Module 3</span>
                    </div>
                    <h3 className="font-sans font-black text-lg mb-4 tracking-tight uppercase text-carbon">Signal Network</h3>
                    <p className="font-sans text-sm leading-relaxed text-gray-600">
                        Track regional health alerts across Kolkata neighborhoods to detect outbreak signals.
                    </p>
                    <div className="mt-8 border-t border-carbon pt-4 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-teal"></div>
                        <span className="font-mono text-[10px] uppercase">Active</span>
                    </div>
                </Link>

                {/* Card 4: Workflow Queue */}
                <Link href="/dashboard/workflow" className="block border border-carbon p-6 md:p-8 bg-paper transition-all cursor-pointer group hover:bg-teal hover:border-teal hover:text-white">
                    <div className="flex justify-between items-start mb-6">
                        <span className="material-symbols-outlined text-3xl text-teal group-hover:text-white">inventory_2</span>
                        <span className="font-mono text-[10px] border border-carbon group-hover:border-white/40 px-2 py-1">Module 4</span>
                    </div>
                    <h3 className="font-sans font-black text-lg mb-4 tracking-tight uppercase text-carbon group-hover:text-white">Workflow Queue</h3>
                    <p className="font-sans text-sm leading-relaxed text-gray-600 group-hover:text-white/80">
                        Clinician approval queue for AI-proposed actions and medication reviews.
                    </p>
                    <div className="mt-8 border-t border-carbon group-hover:border-white/10 pt-4 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-teal group-hover:bg-white"></div>
                        <span className="font-mono text-[10px] uppercase font-bold tracking-widest">
                            {workflowCount > 0 ? `${workflowCount} Actions Pending` : "Queue Empty"}
                        </span>
                    </div>
                </Link>
            </aside>
        </div>
    );
}
