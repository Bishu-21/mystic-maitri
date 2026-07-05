import Link from "next/link";

export default function Header() {
    return (
        <header className="border-b border-carbon bg-paper/80 backdrop-blur-sm flex justify-between items-center px-8 py-4 sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="size-6 bg-carbon flex items-center justify-center">
                    <span className="material-symbols-outlined text-paper text-sm">terminal</span>
                </div>
                <span className="font-mono text-xl font-bold uppercase tracking-tighter text-carbon">Mystic</span>
                <span className="text-xs text-teal font-mono tracking-widest hidden md:inline ml-4 border-l border-carbon pl-4">NEURAL CORE ACTIVE</span>
            </div>

            <div className="flex items-center gap-8">
                <Link href="/auth" className="px-6 py-2 border border-carbon rounded-full font-mono text-xs uppercase tracking-widest font-bold text-carbon hover:bg-carbon hover:text-paper transition-colors block text-center">
                    AUTHORIZE
                </Link>
            </div>
        </header>
    );
}
