import { ScanText, BarChart3, Bot, MapPin } from "lucide-react";

export function Features() {
    const features = [
        {
            title: "Prescription OCR",
            description: "Digitize handwritten notes instantly using advanced vision AI.",
            icon: <ScanText className="h-10 w-10 text-primary" />
        },
        {
            title: "Stockout Alerts",
            description: "Predictive warnings for low inventory based on local demand patterns.",
            icon: <BarChart3 className="h-10 w-10 text-sunset-coral" />
        },
        {
            title: "AI Health Coach",
            description: "Personalized wellness guidance and medication reminders for patients.",
            icon: <Bot className="h-10 w-10 text-sage-green-600" />
        },
        {
            title: "10km Analytics",
            description: "Localized health data insights to map disease outbreaks and supply needs.",
            icon: <MapPin className="h-10 w-10 text-primary" />
        }
    ];

    return (
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24" id="platform">
            <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-50 mb-4">Powerful Core Operating System</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">Purpose-built infrastructure for the unique challenges of rural healthcare logistics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                {/* Item 1: Prescription OCR (Large) */}
                <div className="md:col-span-2 glass-morphism rounded-3xl p-8 border border-white/10 group transition-all duration-300 hover:-translate-y-1 hover:border-white/20 flex flex-col lg:flex-row gap-8 overflow-hidden">
                    <div className="flex-1">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400">
                            <ScanText className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-50 mb-4">Prescription OCR</h3>
                        <p className="text-slate-400">Instantly convert messy handwritten prescriptions into clean, structured digital data for automated dispensing.</p>
                    </div>
                    <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 p-4 font-mono text-[10px] overflow-hidden relative shadow-inner">
                        {/* Animated Code Mockup */}
                        <div className="space-y-2">
                            <div className="flex gap-4 items-start">
                                <span className="text-emerald-500">SCAN:</span>
                                <span className="text-slate-500 italic">[Handwritten Image Path]</span>
                            </div>
                            <div className="pt-2 border-t border-white/5">
                                <div className="text-blue-400">JSON Output: {"{"}</div>
                                <div className="pl-4"><span className="text-cyan-400">&quot;patient&quot;</span>: &quot;N. Murthy&quot;,</div>
                                <div className="pl-4"><span className="text-cyan-400">&quot;drug&quot;</span>: &quot;Metformin 500mg&quot;,</div>
                                <div className="pl-4"><span className="text-cyan-400">&quot;qty&quot;</span>: 30,</div>
                                <div className="pl-4"><span className="text-cyan-400">&quot;freq&quot;</span>: &quot;1-0-1&quot;</div>
                                <div className="text-blue-400">{"}"}</div>
                            </div>
                        </div>
                        {/* Overlay gradient */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>
                </div>

                {/* Item 2: Demand Forecasting */}
                <div className="glass-morphism rounded-3xl p-8 border border-white/10 group transition-all duration-300 hover:-translate-y-1 hover:border-white/20 flex flex-col justify-between overflow-hidden">
                    <div>
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 text-cyan-400">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-50 mb-3">Demand Forecasting</h3>
                        <p className="text-sm text-slate-400">Never miss a critical refill with hyperlocal predictive modeling.</p>
                    </div>
                    {/* Visual: Low stock alert */}
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <div className="text-xs">
                            <div className="text-slate-200 font-semibold">Low Stock Alert</div>
                            <div className="text-slate-400">Amoxicillin: 2 days left</div>
                        </div>
                    </div>
                </div>

                {/* Item 3: Local Health Graph */}
                <div className="glass-morphism rounded-3xl p-8 border border-white/10 group transition-all duration-300 hover:-translate-y-1 hover:border-white/20 flex flex-col justify-between overflow-hidden relative">
                    <div className="z-10">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-50 mb-3">Local Health Graph</h3>
                        <p className="text-sm text-slate-400">Mapping disease trends within a 10km radius of your shop.</p>
                    </div>
                    {/* Visual: Radius map */}
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"></div>
                        </div>
                    </div>
                </div>

                {/* Item 4: Unified Wholesale Gateway */}
                <div className="glass-morphism rounded-3xl p-8 border border-white/10 group transition-all duration-300 hover:-translate-y-1 hover:border-white/20 flex items-center justify-between col-span-1 md:col-span-2">
                    <div className="max-w-md">
                        <h3 className="text-xl font-bold text-slate-50 mb-3">Unified Wholesale Gateway</h3>
                        <p className="text-sm text-slate-400">One-click ordering from the top 5 distributors in your region with pre-negotiated volume discounts.</p>
                    </div>
                    <div className="hidden sm:flex gap-4">
                        <div className="w-14 h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs text-slate-500">A</div>
                        <div className="w-14 h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs text-slate-500">B</div>
                        <div className="w-14 h-14 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs text-slate-500">C</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
