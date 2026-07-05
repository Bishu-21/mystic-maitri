import Link from "next/link";

export default function HeroManifesto() {
    return (
        <section className="h-full flex flex-col justify-center p-8 md:p-16 border-r-0 lg:border-r border-carbon bg-paper/40">
            <div className="max-w-3xl animate-fade-in">
                <p className="text-xs font-bold mb-8 flex items-center gap-2 font-mono uppercase tracking-widest text-carbon">
                    <span className="inline-block w-8 h-[1px] bg-carbon"></span>
                    CLINIC WORKFLOW HUB
                </p>
                <h1 className="font-sans font-black text-6xl md:text-8xl lg:text-[80px] leading-[0.9] text-carbon mb-12 uppercase tracking-tight">
                    A Smarter Clinical Portal
                </h1>
                <div className="space-y-6">
                    <div className="font-mono text-sm tracking-tight uppercase max-w-xl leading-relaxed text-carbon">
                        <span className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-teal"></span>
                            System Status: <span className="text-teal font-bold">Online</span>
                        </span>
                        <p className="opacity-80">
                            Maitri is a secure, human-in-the-loop clinical coordinator that digitizes doctor prescriptions, records voice dictation, and visualizes regional health alerts.
                        </p>
                    </div>
                    <p className="text-xs font-mono tracking-widest uppercase text-slate-500">
                        CLINICIAN AUDITED WORKFLOWS / SECURE COMPLIANT ENGINE
                    </p>
                    <div className="pt-8">
                        <Link href="/dashboard" className="inline-block bg-carbon text-paper text-xs font-bold px-10 py-4 rounded-full hover:bg-teal transition-all tracking-widest uppercase font-mono shadow-sm">
                            Access Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
