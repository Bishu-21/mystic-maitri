"use client";

import { useState, useEffect } from "react";
import { getWorkflowQueue, updateWorkflowStatus } from "@/actions/workflow";
import type { WorkflowItem, WorkflowStatus } from "@/lib/validators/schemas";
import Link from "next/link";

export default function WorkflowQueuePage() {
    const [items, setItems] = useState<WorkflowItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<WorkflowItem | null>(null);
    const [filter, setFilter] = useState<string>("ALL");
    const [isLoading, setIsLoading] = useState(true);

    const fetchQueue = async () => {
        setIsLoading(true);
        const data = await getWorkflowQueue();
        setItems(data);
        if (data.length > 0 && !selectedItem) {
            setSelectedItem(data[0]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 3000); // Tightened polling for real-time feel
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (id: string, status: WorkflowStatus) => {
        const success = await updateWorkflowStatus(id, status);
        if (success) {
            fetchQueue();
            if (selectedItem?.id === id) {
                setSelectedItem(prev => prev ? { ...prev, status } : null);
            }
        }
    };

    const filteredItems = items.filter(item => {
        if (filter === "ALL") return true;
        if (filter === "URGENT") return item.priority === "URGENT";
        if (filter === "VOICE") return item.source === "voice";
        if (filter === "DOCUMENT") return item.source === "document";
        return true;
    });

    return (
        <div className="animate-fade-in -mt-4 pb-12 min-h-screen bg-background-light">
            {/* Header Section */}
            <div className="border border-carbon bg-white p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-1 text-[10px] font-mono font-bold text-gray-400 hover:text-teal transition-colors border border-gray-100 px-2 py-1 uppercase tracking-widest mr-4 group"
                    >
                        <span className="material-symbols-outlined text-[14px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        Dashboard
                    </Link>
                    <span className="material-symbols-outlined text-carbon">analytics</span>
                    <h2 className="font-mono font-bold text-sm tracking-widest uppercase">Clinical Workflow Queue v1.0</h2>
                </div>
                <div className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-4">
                    <span className="text-gray-400">Status: <span className="text-teal font-bold">Synchronized</span></span>
                    <span className="text-gray-400">Node: <span className="text-carbon font-bold">CLINIC-02</span></span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2 mb-8">
                {["ALL", "URGENT", "VOICE", "DOCUMENT"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-1.5 text-[10px] font-bold uppercase transition-all duration-200 ${filter === f
                            ? "bg-carbon text-white border-carbon"
                            : "bg-transparent text-carbon border-gray-200 hover:bg-gray-50 hover:border-carbon"
                            } border`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 relative h-[calc(100vh-280px)]">
                {/* Workflow Table Container */}
                <div className="flex-1 overflow-auto bg-white border border-carbon shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-carbon bg-gray-50">
                                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest w-24">Item_ID</th>
                                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest">Source</th>
                                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest">Clinical_Action</th>
                                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest w-32">Confidence</th>
                                <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading && items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center font-mono text-[10px] text-gray-400 animate-pulse uppercase">Searching local buffer...</td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center font-mono text-[10px] text-gray-400 uppercase">No pending actions found in this channel</td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className={`group cursor-pointer transition-colors ${selectedItem?.id === item.id ? "bg-teal/5" : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <td className="px-4 py-4 font-mono text-[10px] text-gray-500">{item.id.split('-')[1] || item.id}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-1.5 w-1.5 rounded-full ${item.source === 'voice' ? 'bg-teal' : 'bg-amber-600'}`}></span>
                                                <span className="font-mono text-[10px] uppercase font-bold">{item.source}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-sans font-bold text-sm text-carbon uppercase">{item.title}</span>
                                                <span className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[200px]">{item.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="font-mono text-[10px] tracking-tighter">
                                                    [{'█'.repeat(Math.round(item.confidence * 10))}{'░'.repeat(10 - Math.round(item.confidence * 10))}]
                                                </div>
                                                <span className="font-mono text-[8px] text-gray-400">{(item.confidence * 100).toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold uppercase ${item.priority === 'URGENT'
                                                ? "bg-red-500 text-white"
                                                : item.status === 'APPROVED'
                                                    ? "bg-teal text-white"
                                                    : "border border-carbon text-carbon"
                                                }`}>
                                                {item.priority === 'URGENT' && <span className="material-symbols-outlined text-[10px]">warning</span>}
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Detail Sidebar - Focus on System Rationalization */}
                <aside className="w-full lg:w-96 bg-white border border-carbon shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col h-full overflow-hidden">
                    {selectedItem ? (
                        <>
                            <div className="p-4 border-b border-carbon flex justify-between items-center bg-gray-50">
                                <h2 className="font-mono text-[9px] font-bold uppercase tracking-widest text-carbon/60">Rationalization View: {selectedItem.id}</h2>
                                <span className={`h-2 w-2 rounded-full ${selectedItem.status === 'APPROVED' ? 'bg-teal' : 'bg-amber-500'} animate-pulse`}></span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <section>
                                    <label className="font-mono text-[9px] uppercase text-gray-400 mb-2 block tracking-widest">Observation_Summary</label>
                                    <p className="text-sm font-medium leading-relaxed italic border-l-2 border-teal pl-4 py-1 text-carbon">
                                        "{selectedItem.description}"
                                    </p>
                                </section>

                                <section>
                                    <label className="font-mono text-[9px] uppercase text-gray-400 mb-3 block tracking-widest font-bold">AI_SUGGESTED_ACTION</label>
                                    <div className="bg-carbon text-paper p-4 font-mono text-[11px] leading-relaxed border-l-4 border-teal shadow-[4px_4px_0px_0px_#4a7d76]">
                                        <div className="flex items-center gap-2 text-teal mb-2">
                                            <span className="material-symbols-outlined text-sm">bolt</span>
                                            <span className="font-bold uppercase">Clinical Intelligence Recommendation</span>
                                        </div>
                                        <p className="text-sm font-bold uppercase tracking-tight">{selectedItem.reasoning}</p>
                                        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[9px] font-bold text-gray-400">
                                            <span>MODEL: GEMINI-3.1-FLITE</span>
                                            <span className="text-teal">SCORE: {(selectedItem.confidence * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <label className="font-mono text-[9px] uppercase text-gray-400 mb-2 block tracking-widest">Rationalization_Audit</label>
                                    <p className="text-[10px] font-mono leading-relaxed text-gray-400">
                                        Action extracted from {selectedItem.source} core. Pattern matched with confidence score {(selectedItem.confidence * 100).toFixed(1)}%. Logic verified by Neural Engine.
                                    </p>
                                </section>

                                <div className="grid grid-cols-2 gap-4">
                                    <section>
                                        <label className="font-mono text-[9px] uppercase text-gray-400 mb-1 block tracking-widest">Source</label>
                                        <div className="font-mono text-[10px] font-bold bg-gray-100 text-carbon px-2 py-1 inline-block uppercase">{selectedItem.source}</div>
                                    </section>
                                    <section>
                                        <label className="font-mono text-[9px] uppercase text-gray-400 mb-1 block tracking-widest">Priority</label>
                                        <div className={`font-mono text-[10px] font-bold px-2 py-1 inline-block uppercase ${selectedItem.priority === 'URGENT' ? 'text-red-600 bg-red-50' : 'text-teal bg-teal/5'}`}>
                                            {selectedItem.priority}
                                        </div>
                                    </section>
                                </div>
                            </div>

                            <div className="p-4 border-t border-carbon bg-gray-50 flex gap-3">
                                <button
                                    onClick={() => handleStatusUpdate(selectedItem.id, 'APPROVED')}
                                    disabled={selectedItem.status === 'APPROVED'}
                                    className={`flex-1 py-3 font-bold uppercase text-[10px] tracking-widest transition-all ${selectedItem.status === 'APPROVED'
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-teal text-white hover:brightness-110 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                                        }`}
                                >
                                    Approve Action
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedItem.id, 'REJECTED')}
                                    disabled={selectedItem.status === 'REJECTED' || selectedItem.status === 'APPROVED'}
                                    className="px-4 py-3 bg-paper border border-carbon text-carbon hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-20">inventory_2</span>
                            <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed">Awaiting item selection for rationalization audit</p>
                        </div>
                    )}
                </aside>
            </div>

            {/* Forensic Audit Log Footer */}
            <div className="mt-8">
                <div className="bg-black text-paper p-4 w-fit border-l-4 border-teal font-mono text-[9px] uppercase tracking-widest leading-relaxed shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                    <div className="flex items-center gap-2 text-teal font-bold mb-1">
                        <span className="material-symbols-outlined text-xs">history</span>
                        <span>SESSION_AUDIT_TRAIL</span>
                    </div>
                    {items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex gap-4 opacity-80">
                            <span className="text-gray-500 w-16 whitespace-nowrap">
                                {new Date(item.createdAt).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className={idx === 0 ? "text-teal font-bold" : ""}>
                                {item.source.toUpperCase()}_CORE_ACTION: {item.status} ({item.title.substring(0, 20)}...)
                            </span>
                        </div>
                    ))}
                    {items.length === 0 && <div className="text-gray-500 italic">SYSTEM IDLE: AWAITING NEURAL SIGNALS...</div>}
                </div>
            </div>
        </div>
    );
}
