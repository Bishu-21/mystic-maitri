import Link from "next/link";

export default function NavigationCards() {
    const cards = [
        {
            id: "01",
            title: "Voice Core",
            desc: "Capture clinical dictation and extract intent with sub-millisecond latency.",
            icon: "graphic_eq",
            href: "/dashboard/voice"
        },
        {
            id: "02",
            title: "Document Engine",
            desc: "Extract structured data from scanned reports and handwritten medical notes.",
            meta: "[LAST PARSED: LAB_REPORT_092.PDF]",
            icon: "document_scanner",
            href: "/dashboard/document"
        },
        {
            id: "03",
            title: "Workflow Queue",
            desc: "Manage intelligent clinical workflows through context-aware task queues.",
            icon: "settings_suggest",
            href: "/dashboard/workflow"
        },
        {
            id: "04",
            title: "Signal Network",
            desc: "Detect operational signals and anomalies across distributed nodes.",
            icon: "radar",
            href: "/dashboard/signals"
        }
    ];

    return (
        <div className="flex flex-col divide-y divide-carbon border-l lg:border-l-0 border-carbon h-full">
            {cards.map((card) => (
                <Link href={card.href} key={card.id} className="group flex-1 flex flex-col justify-center p-8 bg-paper hover:bg-carbon hover:text-paper transition-colors duration-300 cursor-crosshair">
                    <div className="flex justify-between items-start mb-6">
                        <span className="material-symbols-outlined text-teal text-3xl group-hover:text-paper transition-colors">
                            {card.icon}
                        </span>
                        <span className="text-[10px] font-bold opacity-50 font-mono">[{card.id}]</span>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <h3 className="text-xl font-serif font-bold uppercase tracking-wider mb-2 text-carbon group-hover:text-paper transition-colors">
                            {card.title}
                        </h3>
                        <p className="text-sm text-slate-500 group-hover:text-grid transition-colors leading-snug font-mono">
                            {card.desc}
                        </p>
                    </div>

                    <div className="mt-8">
                        {card.meta && (
                            <p className="text-[9px] font-mono text-teal group-hover:text-teal mb-3 opacity-80 uppercase tracking-tighter">
                                {card.meta}
                            </p>
                        )}
                        <span className="border border-carbon text-carbon group-hover:border-paper group-hover:bg-paper group-hover:text-carbon text-[10px] font-bold py-2 px-4 rounded-full uppercase tracking-widest font-mono transition-colors inline-block">
                            Access Node
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    );
}
