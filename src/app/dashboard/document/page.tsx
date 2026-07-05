"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { processDocumentOCR } from "@/actions/document-ocr";

interface ExtractedField {
    name: string;
    label: string;
    value: string;
    confidence: number;
    boundingBox: number[] | null;
    validation: "NOMINAL" | "ANOMALY_DETECTED";
    interpretation: string;
    explanation: string;
}

interface ExtractedData {
    docType: string;
    docConfidence: number;
    fields: ExtractedField[];
    proposedAction: string;
    metadata: {
        ocr_engine: string;
        reasoning_model: string;
        schema: string;
    };
}

const ConfidenceBar = ({ value, color = "bg-teal" }: { value: number, color?: string }) => {
    const bars = 12;
    const filled = Math.round(value * bars);
    return (
        <div className="flex gap-0.5 font-mono text-[10px]">
            {Array.from({ length: bars }).map((_, i) => (
                <span key={i} className={i < filled ? color : "text-gray-200"}>
                    {i < filled ? "█" : "░"}
                </span>
            ))}
            <span className="ml-2 font-bold opacity-60">{(value * 100).toFixed(0)}%</span>
        </div>
    );
};

interface LogEntry {
    time: string;
    msg: string;
}

export default function DocumentEnginePage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
    const [statusLogs, setStatusLogs] = useState<LogEntry[]>([]);
    const [editingField, setEditingField] = useState<number | null>(null);
    const [hoveredField, setHoveredField] = useState<number | null>(null);
    const [explainingField, setExplainingField] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [imgSize, setImgSize] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });

    const logStatus = (msg: string) => {
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        setStatusLogs(prev => [...prev, { time, msg }]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            processFile(selected);
        }
    };

    const processFile = (file: File) => {
        setFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setExtractedData(null);
        setProgress(0);
        logStatus(`DOCUMENT_UPLOADED: ${file.name.toUpperCase()}`);
    };

    const startOCR = async () => {
        if (!file) return;

        setIsProcessing(true);
        setExtractedData(null);
        setProgress(15);
        logStatus("OCR_HANDSHAKE_INITIATED");

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = reader.result as string;
                setProgress(30);
                logStatus("SCANNING_MATRIX: AZURE_READ_ENGINE");

                const result = await processDocumentOCR(base64);

                if (result.data) {
                    if (!result.success) {
                        logStatus(`WARNING: ${result.error || "Using low-confidence fallback"}`);
                    } else {
                        logStatus("LAYOUT_EXTRACTION_COMPLETE");
                    }
                    setProgress(60);

                    setTimeout(() => {
                        setProgress(85);
                        logStatus("AI_INTERPRETATION_STARTED: GEMINI_3.1_FLASH");

                        setTimeout(() => {
                            setProgress(100);
                            logStatus("AI_INTERPRETATION_COMPLETE");
                            logStatus(result.success ? "WORKFLOW_READY: FORENSIC_VALIDATION_SIGNED" : "WORKFLOW_READY: UNVERIFIED_FALLBACK_SIGNED");
                            // @ts-ignore
                            setExtractedData(result.data);
                            setIsProcessing(false);
                        }, 800);
                    }, 600);
                } else {
                    logStatus(`ERROR: ${result.error}`);
                    setIsProcessing(false);
                }
            };
        } catch (error) {
            logStatus("CRITICAL_SYSTEM_ERROR: INTERNAL_FAULT");
            setIsProcessing(false);
        }
    };

    const handleImageLoad = () => {
        if (imgRef.current) {
            setImgSize({
                width: imgRef.current.clientWidth,
                height: imgRef.current.clientHeight,
                naturalWidth: imgRef.current.naturalWidth,
                naturalHeight: imgRef.current.naturalHeight
            });
        }
    };

    // Calculate Bounding Box coordinates as percentages
    const getBoxStyle = (polygon: number[]) => {
        if (!imgSize.naturalWidth || !imgSize.naturalHeight) return {};

        const xs = [polygon[0], polygon[2], polygon[4], polygon[6]];
        const ys = [polygon[1], polygon[3], polygon[5], polygon[7]];

        const xMin = Math.min(...xs);
        const xMax = Math.max(...xs);
        const yMin = Math.min(...ys);
        const yMax = Math.max(...ys);

        return {
            left: `${(xMin / imgSize.naturalWidth) * 100}%`,
            top: `${(yMin / imgSize.naturalHeight) * 100}%`,
            width: `${((xMax - xMin) / imgSize.naturalWidth) * 100}%`,
            height: `${((yMax - yMin) / imgSize.naturalHeight) * 100}%`,
        };
    };

    return (
        <div className="animate-fade-in -mt-4 pb-12">
            {/* 10/10 Timeline Indicator */}
            <div className="flex justify-center mb-8">
                <div className="flex items-center gap-4 font-mono text-[9px] tracking-widest uppercase">
                    <div className={`flex items-center gap-2 ${file ? 'text-teal' : 'text-gray-300'}`}>
                        <span className="h-2 w-2 rounded-full bg-current"></span> UPLOAD
                    </div>
                    <div className="h-[1px] w-8 bg-gray-200"></div>
                    <div className={`flex items-center gap-2 ${progress >= 30 ? 'text-teal' : 'text-gray-300'}`}>
                        <span className="h-2 w-2 rounded-full bg-current"></span> OCR_SCAN
                    </div>
                    <div className="h-[1px] w-8 bg-gray-200"></div>
                    <div className={`flex items-center gap-2 ${progress >= 60 ? 'text-teal' : 'text-gray-300'}`}>
                        <span className="h-2 w-2 rounded-full bg-current"></span> STRUCTURE
                    </div>
                    <div className="h-[1px] w-8 bg-gray-200"></div>
                    <div className={`flex items-center gap-2 ${extractedData ? 'text-teal' : 'text-gray-300'}`}>
                        <span className="h-2 w-2 rounded-full bg-current"></span> QUEUE
                    </div>
                </div>
            </div>

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
                    <span className="material-symbols-outlined text-carbon">grid_view</span>
                    <h2 className="font-mono font-bold text-sm tracking-widest uppercase">Forensic Document Engine v2.0</h2>
                </div>
                <div className="flex gap-6 font-mono text-[10px] tracking-widest uppercase font-bold text-gray-400">
                    <span className="border-r border-carbon/10 pr-6">Status: <span className="text-teal">Online</span></span>
                    <span className="border-r border-carbon/10 pr-6">OCR: <span className="text-teal">Azure Doc Intelligence</span></span>
                    <span>Engine: <span className="text-teal">General-Document Neural</span></span>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Panel: Scanned Document */}
                <section className="col-span-12 lg:col-span-6 flex flex-col gap-4">
                    <div className="flex justify-between items-end font-mono text-[11px] uppercase tracking-tighter text-gray-500">
                        <span>SOURCE_FILE: {file ? file.name.toUpperCase() : "AWAITING_INPUT"}</span>
                        <div className="flex gap-2 bg-carbon text-paper px-2 py-1">
                            <button className="hover:text-teal transition-colors px-1" onClick={() => logStatus("NAV: ZOOM_IN")}>+</button>
                            <span className="border-x border-paper/20 px-2">100%</span>
                            <button className="hover:text-teal transition-colors px-1" onClick={() => logStatus("NAV: ZOOM_OUT")}>-</button>
                        </div>
                    </div>

                    <div className="flex-grow bg-white border border-carbon relative overflow-hidden flex items-center justify-center p-8 min-h-[600px] cursor-crosshair group"
                        onClick={() => fileInputRef.current?.click()}>

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            accept="image/*,application/pdf"
                        />

                        {previewUrl ? (
                            <div className="relative w-full border border-gray-100 shadow-xl bg-[#fafafa]">
                                <img
                                    ref={imgRef}
                                    src={previewUrl}
                                    onLoad={handleImageLoad}
                                    className="w-full h-auto opacity-90 grayscale contrast-125 transition-all group-hover:grayscale-0"
                                    alt="Preview"
                                />
                                {/* Render Bounding Boxes */}
                                {extractedData?.fields.map((field, idx) => field.boundingBox && (
                                    <div
                                        key={idx}
                                        style={{
                                            ...getBoxStyle(field.boundingBox),
                                            backgroundColor: hoveredField === idx ? "rgba(75, 127, 120, 0.3)" : "rgba(75, 127, 120, 0.1)",
                                            border: "1px solid #4B7F78",
                                        }}
                                        onMouseEnter={() => setHoveredField(idx)}
                                        onMouseLeave={() => setHoveredField(null)}
                                        className={`absolute transition-all cursor-pointer z-10 ${hoveredField === idx ? 'scale-[1.02] ring-2 ring-teal/30 shadow-lg' : ''}`}
                                    >
                                        <span className={`absolute -top-4 left-0 text-[8px] font-mono whitespace-nowrap px-1 border border-[#4B7F78] ${hoveredField === idx ? 'bg-teal text-white' : 'bg-[#4B7F78]/10 text-teal backdrop-blur-sm'}`}>
                                            {field.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-carbon/40 hover:text-teal transition-colors">
                                <span className="material-symbols-outlined text-6xl">upload_file</span>
                                <p className="font-mono text-xs uppercase tracking-[0.2em]">Drop document or click to upload</p>
                            </div>
                        )}
                    </div>
                    {file && !extractedData && !isProcessing && (
                        <button
                            className="bg-carbon text-paper py-4 font-mono font-bold uppercase tracking-widest text-xs hover:bg-teal transition-colors shadow-lg"
                            onClick={startOCR}
                        >
                            [ Initiate Forensic Analysis Matrix ]
                        </button>
                    )}
                </section>

                {/* Right Panel: Structured Data */}
                <section className="col-span-12 lg:col-span-6 flex flex-col gap-6">
                    <div className="border border-carbon bg-white p-6 flex flex-col h-full min-h-[600px]">

                        {/* 10/10 Doc Type Badge */}
                        {extractedData && (
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex flex-col gap-1">
                                    <span className="font-mono text-[8px] text-gray-400 uppercase tracking-widest leading-none">Document Classification</span>
                                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-carbon">
                                        {extractedData.docType.replace(/_/g, " ")}
                                    </span>
                                    <ConfidenceBar value={extractedData.docConfidence} />
                                </div>
                                <div className="flex gap-2">
                                    <button className="h-8 w-8 border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                                        <span className="material-symbols-outlined text-sm">print</span>
                                    </button>
                                    <button className="h-8 w-8 border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                                        <span className="material-symbols-outlined text-sm">download</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-2">
                                <h2 className="font-mono font-bold text-sm tracking-widest uppercase">
                                    {isProcessing ? "Processing Data..." : extractedData ? "Forensic Extraction List" : "Awaiting Data Matrix"}
                                </h2>
                                <span className="font-mono text-xs">{progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-gray-100">
                                <div
                                    className="bg-carbon h-1 transition-all duration-700 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {extractedData ? (
                            <div className="flex flex-col gap-0 border-t border-carbon">
                                {extractedData.fields.map((field, idx) => (
                                    <div
                                        key={idx}
                                        onMouseEnter={() => setHoveredField(idx)}
                                        onMouseLeave={() => setHoveredField(null)}
                                        className={`flex flex-col py-4 border-b border-carbon/5 transition-colors ${hoveredField === idx ? 'bg-teal/[0.02]' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-[9px] text-gray-400 uppercase">{field.label || field.name}</span>
                                                    {field.validation === "ANOMALY_DETECTED" && (
                                                        <span className="bg-amber-600 text-white text-[8px] font-mono px-1.5 py-0.5 animate-pulse uppercase">⚠ {field.interpretation || "Anomaly"}</span>
                                                    )}
                                                    {field.validation === "NOMINAL" && field.interpretation && (
                                                        <span className="bg-teal/10 text-teal text-[8px] font-mono px-1.5 py-0.5 uppercase">{field.interpretation}</span>
                                                    )}
                                                </div>

                                                {editingField === idx ? (
                                                    <input
                                                        autoFocus
                                                        className="mt-1 font-serif italic text-lg text-carbon border-b border-teal outline-none bg-teal/5 px-2"
                                                        defaultValue={field.value}
                                                        onBlur={() => setEditingField(null)}
                                                        onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                                                    />
                                                ) : (
                                                    <span className={`font-serif italic text-xl mt-1 flex items-center gap-2 ${field.validation === "ANOMALY_DETECTED" ? 'text-amber-600' : 'text-carbon'}`}>
                                                        {field.value}
                                                        <button
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center"
                                                            onClick={(e) => { e.stopPropagation(); setEditingField(idx); }}
                                                        >
                                                            <span className="material-symbols-outlined text-[14px] text-gray-300 hover:text-carbon ml-2 cursor-pointer">edit</span>
                                                        </button>
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <ConfidenceBar
                                                    value={field.confidence}
                                                    color={field.validation === "ANOMALY_DETECTED" ? "text-amber-500" : "text-teal"}
                                                />
                                                <button
                                                    className="mt-1 text-[8px] font-mono text-gray-400 border border-gray-100 px-2 py-0.5 hover:bg-carbon hover:text-paper transition-all uppercase tracking-widest"
                                                    onClick={() => setExplainingField(explainingField === idx ? null : idx)}
                                                >
                                                    {explainingField === idx ? "HIDE_SOURCE" : "WHY_THIS?"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* 10/10 Explainability Panel */}
                                        {explainingField === idx && (
                                            <div className="mt-3 p-4 bg-carbon text-[10px] font-mono text-gray-300 leading-relaxed border-l-4 border-teal animate-slide-down shadow-2xl">
                                                <div className="flex items-center gap-2 text-teal font-bold uppercase mb-2">
                                                    <span className="material-symbols-outlined text-sm">psychology</span>
                                                    System Rationalization (Gemini 3.1 Flash)
                                                </div>
                                                <div className="space-y-1.5 opacity-90">
                                                    {field.explanation.split('|').map((part, i) => (
                                                        <div key={i} className="flex items-start gap-2">
                                                            <span className="text-teal text-[12px] opacity-50">▸</span>
                                                            <span className="uppercase tracking-tight">{part.trim()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-white/5 text-gray-500 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                                                        SPATIAL_COORDINATES: {field.boundingBox ? `[${field.boundingBox[0]}, ${field.boundingBox[1]}]` : "LOGICAL_INFERENCE"}
                                                    </div>
                                                    <div className="flex items-center gap-1 font-bold">
                                                        SCORE: {(field.confidence * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="mt-8 p-4 border border-teal/20 bg-teal/[0.03] flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center bg-teal text-white rounded-full">
                                            <span className="material-symbols-outlined">verified</span>
                                        </div>
                                        <div>
                                            <span className="block font-mono text-[9px] font-bold text-teal uppercase tracking-widest">Global Clinical Summary</span>
                                            <span className="text-sm font-bold leading-tight block max-w-[300px]">{extractedData.proposedAction}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="bg-carbon text-paper px-6 py-3 font-mono font-bold uppercase tracking-widest text-xs hover:bg-teal transition-all flex items-center gap-2 group"
                                        onClick={() => {
                                            logStatus("ACTION: SENT_TO_WORKFLOW");
                                            router.push("/dashboard/workflow");
                                        }}
                                    >
                                        [ Send to Queue ]
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">send</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-carbon/20 italic font-serif text-2xl gap-4">
                                <span className="material-symbols-outlined text-6xl opacity-10">fingerprint</span>
                                <span>Awaiting forensic uplink...</span>
                            </div>
                        )}

                        <div className="mt-auto pt-6 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="font-mono text-[9px] font-bold text-carbon/40 uppercase tracking-widest leading-none">Extraction Core</p>
                                    <p className="font-mono text-[10px] text-teal font-medium uppercase">{extractedData?.metadata.ocr_engine || "Azure Document Intelligence v4.0"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-mono text-[9px] font-bold text-carbon/40 uppercase tracking-widest leading-none">Reasoning Node</p>
                                    <p className="font-mono text-[10px] text-teal font-medium uppercase">{extractedData?.metadata.reasoning_model || "Gemini 3.1 Flash Lite"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-mono text-[9px] font-bold text-carbon/40 uppercase tracking-widest leading-none">Extraction Schema</p>
                                    <p className="font-mono text-[10px] text-teal font-medium uppercase">{extractedData?.metadata.schema || "Clinical Schema v1.2"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-mono text-[9px] font-bold text-carbon/40 uppercase tracking-widest leading-none">Security Encryption</p>
                                    <p className="font-mono text-[10px] text-teal font-medium uppercase">AES-256 GCM Forensic</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Event Logs */}
                    <div className="border border-carbon bg-white flex flex-col">
                        <div className="bg-carbon/5 border-b border-carbon/10 px-4 py-2 font-serif text-base italic text-carbon flex justify-between">
                            FORENSIC EVENT LOGS
                            <span className="font-mono text-[10px] opacity-50 not-italic pt-1">{statusLogs.length} SIGNALS</span>
                        </div>
                        <div className="p-4 font-mono text-[9px] text-gray-500 space-y-2 h-[120px] overflow-y-auto custom-scrollbar">
                            {statusLogs.length === 0 ? (
                                <div className="h-full flex items-center justify-center italic opacity-30">No system events logged.</div>
                            ) : (
                                statusLogs.slice().reverse().map((log, index) => (
                                    <div key={index} className="flex justify-between border-b border-gray-50 pb-1 w-full gap-4">
                                        <span className="shrink-0 font-bold">{log.time}</span>
                                        <span className={`text-right ${log.msg.includes("ERROR") ? "text-red-500" : (log.msg.includes("SUCCESS") || log.msg.includes("FINISHED") ? "text-teal" : "text-carbon")}`}>
                                            {log.msg}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
