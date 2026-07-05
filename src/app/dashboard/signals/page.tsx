"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLiveSignals, type HealthSignal } from "@/actions/signals";
import { generateOutbreakAdvisory } from "@/actions/public-health-advisory";

const zipCoordinates: Record<string, { top: string; left: string; name: string }> = {
    "700015": { top: "42%", left: "45%", name: "Beliaghata / Tangra" },
    "700091": { top: "30%", left: "68%", name: "Salt Lake / Sector V" },
    "700016": { top: "55%", left: "35%", name: "Park Street / Mullick Bazar" },
    "700009": { top: "25%", left: "28%", name: "Rajabazar / Amherst St" },
    "700020": { top: "68%", left: "50%", name: "Bhowanipore / Elgin Rd" }
};

const typeIconMap: Record<HealthSignal["type"], string> = {
    "RESPIRATORY_CLUSTER": "change_history",
    "CARDIOLOGY_SIGNAL": "square",
    "DIAGNOSTICS_REF": "circle",
    "FEVER_CLUSTER": "change_history",
    "DENGUE_SPIKE": "warning"
};

const typeLabelMap: Record<HealthSignal["type"], string> = {
    "RESPIRATORY_CLUSTER": "Respiratory Cluster",
    "CARDIOLOGY_SIGNAL": "Cardiology Signal",
    "DIAGNOSTICS_REF": "Diagnostics Ref",
    "FEVER_CLUSTER": "Fever Cluster",
    "DENGUE_SPIKE": "Dengue Outbreak"
};

export default function SignalNetworkPage() {
    const [signals, setSignals] = useState<HealthSignal[]>([]);
    const [selectedSignal, setSelectedSignal] = useState<HealthSignal | null>(null);
    const [streamDensity, setStreamDensity] = useState(840);
    const [advisoryText, setAdvisoryText] = useState<string>("");
    const [advisoryLang, setAdvisoryLang] = useState<string>("en");
    const [isLoadingAdvisory, setIsLoadingAdvisory] = useState(false);
    const [advisoryError, setAdvisoryError] = useState<string | null>(null);

    const fetchSignals = async () => {
        const data = await getLiveSignals();
        setSignals(data);
        setStreamDensity(prev => prev + Math.floor(Math.random() * 10 - 5));
    };

    useEffect(() => {
        fetchSignals();
        const interval = setInterval(fetchSignals, 5000);
        return () => clearInterval(interval);
    }, []);

    // Set first signal as default selection once fetched
    useEffect(() => {
        if (signals.length > 0 && !selectedSignal) {
            setSelectedSignal(signals[0]);
        }
    }, [signals]);

    // Load advisory whenever selected signal or language changes
    useEffect(() => {
        const loadAdvisory = async () => {
            if (!selectedSignal) return;
            setIsLoadingAdvisory(true);
            setAdvisoryError(null);
            try {
                const result = await generateOutbreakAdvisory(
                    selectedSignal.zipCode,
                    selectedSignal.type,
                    selectedSignal.cases,
                    advisoryLang
                );
                if (result.success && result.data) {
                    setAdvisoryText(result.data);
                } else {
                    setAdvisoryError(result.error || "Failed to load advisory.");
                }
            } catch (err) {
                setAdvisoryError("Network error loading advisory.");
            } finally {
                setIsLoadingAdvisory(false);
            }
        };

        loadAdvisory();
    }, [selectedSignal, advisoryLang]);

    const handleSignalSelect = (sig: HealthSignal) => {
        setSelectedSignal(sig);
    };

    return (
        <div className="animate-fade-in -mt-4 pb-12 min-h-screen bg-white font-display text-slate-900 overflow-hidden flex flex-col relative">
            <style jsx global>{`
                .graph-paper {
                    background-size: 24px 24px;
                    background-image: linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                                      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
                }
                .dotted-border {
                    border-style: dotted;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* Header Section */}
            <header className="h-14 border-b border-black flex items-center justify-between px-6 bg-white z-50">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-1 text-[10px] font-mono font-bold text-gray-400 hover:text-teal transition-colors border border-gray-100 px-2 py-1 uppercase tracking-widest mr-4 group"
                    >
                        <span className="material-symbols-outlined text-[14px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        Dashboard
                    </Link>
                    <span className="font-mono text-xs md:text-sm font-bold tracking-tighter uppercase">Mystic Maitri | Signal Network</span>
                </div>
                <div className="hidden md:flex items-center gap-6 font-mono text-[10px] font-bold">
                    <div className="flex items-center gap-2">
                        <span className="size-2 bg-teal rounded-full animate-ping"></span>
                        <span>NETWORK STATUS: <span className="text-teal">ACTIVE</span></span>
                    </div>
                    <div className="border-l border-slate-300 h-4"></div>
                    <span>SIGNALS DETECTED: {signals.length}</span>
                    <div className="border-l border-slate-300 h-4"></div>
                    <span>DATA STREAM: <span className="text-teal">LIVE</span></span>
                </div>
            </header>

            <main className="flex-grow flex flex-col md:flex-row overflow-hidden relative graph-paper">
                {/* Central Radar Visualization Area */}
                <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 min-h-[400px]">
                    {/* Outline Map Mockup */}
                    <div className="relative w-full md:w-4/5 h-4/5 border border-slate-200 dotted-border flex items-center justify-center transition-all">
                        <svg className="w-full h-full opacity-20" viewBox="0 0 800 600">
                            <path d="M100,100 L200,80 L350,120 L500,90 L700,150 L750,300 L650,500 L400,550 L150,480 L50,300 Z" fill="none" stroke="black" strokeDasharray="4 4" strokeWidth="1"></path>
                            <line stroke="black" strokeDasharray="2 2" strokeWidth="0.5" x1="400" x2="400" y1="0" y2="600"></line>
                            <line stroke="black" strokeDasharray="2 2" strokeWidth="0.5" x1="0" x2="800" y1="300" y2="300"></line>
                        </svg>

                        {/* Dynamic Signal Markers */}
                        {signals.map((sig) => {
                            const coords = zipCoordinates[sig.zipCode];
                            if (!coords) return null;
                            const isSelected = selectedSignal?.id === sig.id;
                            const isUrgent = sig.severity === "URGENT";

                            return (
                                <div
                                    key={sig.id}
                                    style={{ top: coords.top, left: coords.left }}
                                    onClick={() => handleSignalSelect(sig)}
                                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-40 transition-all ${
                                        isSelected ? "scale-125" : "hover:scale-110"
                                    }`}
                                >
                                    <div className="relative">
                                        {/* Pulse effect */}
                                        <span className={`absolute inset-0 rounded-full h-8 w-8 -m-1 animate-ping opacity-25 ${
                                            isUrgent ? "bg-red-500" : "bg-teal"
                                        }`}></span>
                                        <span className={`material-symbols-outlined text-3xl ${
                                            isUrgent ? "text-red-500" : "text-teal"
                                        }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                            {typeIconMap[sig.type] || "place"}
                                        </span>
                                    </div>

                                    {/* Tooltip Overlay */}
                                    <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white border border-black p-3 shadow-md z-50 ${
                                        isSelected ? "block" : "hidden group-hover:block"
                                    }`}>
                                        <div className="font-mono text-[10px] font-bold leading-tight">
                                            <div className="flex justify-between border-b border-slate-100 pb-1 mb-1">
                                                <span className={`${isUrgent ? "text-red-600" : "text-teal"} uppercase tracking-tighter`}>
                                                    {sig.type.replace("_", " ")}
                                                </span>
                                                <span className="text-gray-400">{sig.zipCode}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between uppercase"><span>Cases</span><span className="text-black font-bold">{sig.cases}</span></div>
                                                <div className="flex justify-between uppercase"><span>Conf</span><span className="text-black font-bold">{(sig.confidence * 100).toFixed(0)}%</span></div>
                                                <div className="flex justify-between uppercase"><span>Area</span><span className="text-gray-500 font-bold truncate max-w-[80px]">{coords.name.split("/")[0]}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats Panel (Floating) */}
                    <div className="absolute top-6 right-6 w-48 md:w-64 bg-white border border-black p-4 font-mono text-[10px] hidden sm:block">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500 uppercase">Active Outbreaks</span>
                                <span className="font-bold">{signals.length.toString().padStart(2, '0')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 uppercase">Nodes Online</span>
                                <span className="font-bold">12</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-100 pt-2 text-teal">
                                <span className="text-slate-500 uppercase">Event Stream</span>
                                <span className="font-bold">{streamDensity}/sec</span>
                            </div>
                        </div>
                    </div>

                    {/* Legend (Desktop) */}
                    <div className="absolute bottom-12 left-6 bg-white border border-black p-3 flex flex-col gap-2 font-mono text-[9px] uppercase tracking-wider hidden md:flex">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-teal text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>change_history</span>
                            <span>Respiratory Surges</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                            <span>Dengue Outbreaks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-teal text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>square</span>
                            <span>Cardiology Signals</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-teal text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span>
                            <span>Diagnostics Alerts</span>
                        </div>
                    </div>
                </div>

                {/* Signal Feed Panel (Right Sidebar on Desktop, Bottom on Mobile) */}
                <aside className="w-full md:w-96 border-t md:border-t-0 md:border-l border-black bg-white flex flex-col z-50 h-auto md:h-full">
                    {/* Top Signal Details */}
                    <div className="p-6 border-b border-black">
                        <h2 className="font-serif italic font-bold text-2xl">Signal Feed</h2>
                        <p className="font-mono text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Kolkata Outbreak Buffer</p>
                    </div>

                    {/* Advisory Panel */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-4 max-h-[50vh] md:max-h-none no-scrollbar">
                        {selectedSignal ? (
                            <div className="border border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] space-y-4">
                                <div className="flex items-start justify-between text-carbon border-b border-slate-100 pb-2">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-[9px] uppercase font-bold text-gray-400">Selected Node</span>
                                        <h3 className="font-mono text-sm font-bold uppercase tracking-tight">{typeLabelMap[selectedSignal.type]}</h3>
                                        <span className="font-mono text-[9px] text-gray-500">{zipCoordinates[selectedSignal.zipCode]?.name || selectedSignal.zipCode}</span>
                                    </div>
                                    <span className={`font-mono text-[8px] border px-2 py-0.5 uppercase font-bold ${
                                        selectedSignal.severity === 'URGENT' ? 'border-red-500 bg-red-50 text-red-500 animate-pulse' : 'border-teal text-teal bg-teal/5'
                                    }`}>
                                        {selectedSignal.severity}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                                    <div className="bg-slate-50 p-2 border border-slate-100">
                                        <span className="text-gray-400 uppercase block">Registered Cases</span>
                                        <span className="text-base font-bold text-slate-800">{selectedSignal.cases}</span>
                                    </div>
                                    <div className="bg-slate-50 p-2 border border-slate-100">
                                        <span className="text-gray-400 uppercase block">AI Confidence</span>
                                        <span className="text-base font-bold text-slate-800">{(selectedSignal.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                {/* Gemma Outbreak Advisor */}
                                <div className="bg-carbon text-paper p-4 font-mono text-[11px] leading-relaxed border-l-4 border-teal flex flex-col gap-3">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                        <div className="flex items-center gap-1.5 text-teal">
                                            <span className="material-symbols-outlined text-sm">psychology</span>
                                            <span className="font-bold uppercase tracking-wide">Gemma 4 Advisory</span>
                                        </div>
                                        
                                        {/* Language switcher */}
                                        <div className="flex gap-1">
                                            {["en", "bn", "hi"].map((l) => (
                                                <button
                                                    key={l}
                                                    type="button"
                                                    onClick={() => setAdvisoryLang(l)}
                                                    className={`px-1.5 py-0.5 text-[8px] font-bold uppercase transition-colors border ${
                                                        advisoryLang === l
                                                            ? "bg-teal text-white border-teal"
                                                            : "bg-transparent text-gray-400 border-white/10 hover:text-white"
                                                    }`}
                                                >
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {isLoadingAdvisory ? (
                                        <div className="flex flex-col items-center justify-center py-6 text-center text-teal/60 animate-pulse gap-2">
                                            <span className="material-symbols-outlined text-2xl animate-spin">sync</span>
                                            <span className="text-[9px] uppercase tracking-widest">Generating Localized Advisory...</span>
                                        </div>
                                    ) : advisoryError ? (
                                        <span className="text-red-400 italic text-[10px]">{advisoryError}</span>
                                    ) : (
                                        <div className="space-y-2 text-paper/90 select-text leading-relaxed whitespace-pre-line">
                                            {advisoryText}
                                        </div>
                                    )}

                                    <div className="text-[7px] text-gray-500 border-t border-white/5 pt-2 uppercase tracking-widest flex justify-between">
                                        <span>Node: KMC-Surveillance</span>
                                        <span>Gemma 4 Agent Active</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 italic text-xs font-mono">
                                Select a signal marker on the map to audit public health response.
                            </div>
                        )}

                        {/* Outbreak Buffer List */}
                        <div className="border-t border-slate-100 pt-4">
                            <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest block mb-3 font-bold">Local Outbreaks List</span>
                            <div className="space-y-3">
                                {signals.map((sig) => (
                                    <div
                                        key={sig.id}
                                        onClick={() => handleSignalSelect(sig)}
                                        className={`border p-3 cursor-pointer transition-colors ${
                                            selectedSignal?.id === sig.id
                                                ? "bg-slate-50 border-black"
                                                : "border-slate-200 hover:border-black opacity-80"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-[10px] font-bold uppercase tracking-tight">{typeLabelMap[sig.type]}</span>
                                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border ${
                                                sig.severity === "URGENT" ? "border-red-500 text-red-500 bg-red-50" : "border-slate-300 text-slate-500"
                                            }`}>{sig.severity}</span>
                                        </div>
                                        <div className="flex justify-between font-mono text-[9px] text-slate-500">
                                            <span>ZIP: {sig.zipCode} ({zipCoordinates[sig.zipCode]?.name.split("/")[0]})</span>
                                            <span className="font-bold text-black">{sig.cases} cases</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}
