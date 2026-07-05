import Link from "next/link";

export default function HeroManifesto() {
    return (
        <section className="h-full flex flex-col justify-center p-8 md:p-16 border-r-0 lg:border-r border-carbon bg-paper/40">
            <div className="max-w-3xl animate-fade-in">
                <p className="text-xs font-bold mb-8 flex items-center gap-2 font-mono uppercase tracking-widest text-carbon">
                    <span className="inline-block w-8 h-[1px] bg-carbon"></span>
                    HUB_INITIALIZATION_v4.0
                </p>
                <h1 className="font-serif italic text-6xl md:text-8xl lg:text-[96px] leading-[0.9] text-carbon mb-12">
                    The system is observing.
                </h1>
                <div className="space-y-6">
                    <div className="font-mono text-sm tracking-tight uppercase max-w-xl leading-relaxed text-carbon">
                        <span className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-teal animate-pulse"></span>
                            SYSTEM STATUS: <span className="text-teal font-bold">LIVE</span>
                        </span>
                        <p className="opacity-80">
                            Mystic is a human-authorized AI coordination layer that converts voice, documents and signals into structured clinical workflows.
                        </p>
                    </div>
                    <p className="text-xs font-mono tracking-widest uppercase text-slate-500">
                        MODEL: GEMINI MULTIMODAL / HUMAN AUTHORIZATION REQUIRED
                    </p>
                    <div className="pt-8">
                        <Link href="/dashboard" className="inline-block bg-carbon text-paper text-xs font-bold px-10 py-4 rounded-full hover:bg-teal transition-colors tracking-widest uppercase font-mono">
                            INITIALIZE NEURAL LINK
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
