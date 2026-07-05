export function SocialProofRibbon() {
    return (
        <section className="border-y border-white/10 bg-white/[0.01] overflow-hidden" data-purpose="social-proof">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
                    <div className="text-center lg:border-r border-white/5">
                        <div className="text-3xl font-bold text-slate-50 mb-1">500+</div>
                        <div className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Rural Nodes</div>
                    </div>
                    <div className="text-center lg:border-r border-white/5">
                        <div className="text-3xl font-bold text-slate-50 mb-1">99.8%</div>
                        <div className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">OCR Accuracy</div>
                    </div>
                    <div className="text-center lg:border-r border-white/5">
                        <div className="text-3xl font-bold text-slate-50 mb-1">0</div>
                        <div className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Stockouts</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-slate-50 mb-1">10km</div>
                        <div className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Care Radius</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
