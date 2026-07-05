"use client";

import { useState, useRef, useEffect } from "react";
import { askClinicalAssistant } from "@/actions/clinical-assistant";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ClinicalAssistant() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userQuery = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userQuery }]);
        setIsLoading(true);

        try {
            const result = await askClinicalAssistant(userQuery);
            if (result.success && result.data) {
                setMessages(prev => [...prev, { role: "assistant", content: result.data }]);
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: "### Error\nFailed to retrieve clinical information." }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", content: "### System Exception\nConnection timeout or model error." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full border border-carbon bg-paper shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            {/* Header */}
            <div className="border-b border-carbon px-4 py-2 flex justify-between items-center bg-carbon/5">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Clinical Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="h-1 w-1 bg-teal rounded-full animate-pulse"></span>
                    <span className="font-mono text-[8px] opacity-40 uppercase">Active</span>
                </div>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs custom-scrollbar max-h-[400px]"
            >
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 p-4 space-y-4">
                        <span className="material-symbols-outlined text-4xl">local_hospital</span>
                        <p className="uppercase leading-relaxed italic">
                            Awaiting clinical query.<br />
                            (e.g., Symptoms of Anemia)
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end text-right" : "items-start text-left"}`}
                    >
                        <span className="text-[8px] font-bold uppercase opacity-30">{msg.role}</span>
                        <div className={`p-3 max-w-[90%] border ${msg.role === "user"
                            ? "bg-carbon text-paper border-carbon"
                            : "bg-white border-carbon text-carbon clinical-markdown"
                            }`}>
                            {msg.role === "assistant" ? (
                                <div className="prose prose-invert prose-xs">
                                    {/* Simplified markdown rendering logic here, or just whitespace wrapping */}
                                    {msg.content.split("\n").map((line, i) => (
                                        <p key={i} className={line.startsWith("###")
                                            ? "font-bold text-teal mt-3 mb-1 border-b border-teal/10 pb-1"
                                            : line.startsWith("•") || line.startsWith("-")
                                                ? "ml-2 py-0.5"
                                                : "py-0.5"}>
                                            {line.replace("### ", "")}
                                        </p>
                                    ))}
                                    <div className="mt-4 pt-2 border-t border-carbon/10 opacity-30 text-[7px] italic">
                                        DISCLAIMER: This AI-generated clinical assistant is for informational use only. All decisions must be authorized by a licensed clinician.
                                    </div>
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-center gap-2 text-[8px] font-bold text-teal animate-pulse uppercase">
                        <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                        Analyzing Medical Knowledge...
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-carbon p-2 bg-white flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Maitri..."
                    className="flex-1 bg-transparent font-mono text-[10px] outline-none px-2 uppercase"
                />
                <button
                    disabled={isLoading || !input.trim()}
                    className="w-10 h-8 flex items-center justify-center bg-carbon text-paper hover:bg-teal transition-all disabled:opacity-30"
                >
                    <span className="material-symbols-outlined text-sm">send</span>
                </button>
            </form>

            <style jsx>{`
                .clinical-markdown h3 { font-weight: bold; color: #14b8a6; margin-top: 8px; font-size: 10px; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; }
            `}</style>
        </div>
    );
}
