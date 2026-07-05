"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";

export default function VoiceCorePage() {
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false); // New state for clinical session
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState<string>("");
    const [interimTranscript, setInterimTranscript] = useState<string>("");
    const [statusLogs, setStatusLogs] = useState<{ time: string, msg: string }[]>([]);
    const [sessionId, setSessionId] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false); // New state for hackathon flair

    // Extracted intents matching the new schema
    const [intentData, setIntentData] = useState<{
        intent: string;
        specialty: string;
        priority: string;
        confidence: number;
        summary: string;
        instructions?: string;
        language?: string;
    } | null>(null);

    const recognizerRef = useRef<speechsdk.SpeechRecognizer | null>(null);
    const isSessionActiveRef = useRef(false); // Track state for SDK handlers
    const [selectedLang, setSelectedLang] = useState<string>("auto"); // manual override

    const logStatus = (msg: string) => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setStatusLogs(prev => [...prev, { time, msg }]);
    };

    useEffect(() => {
        // Initialize logs
        logStatus("SYSTEM INITIALIZATION");
        // Fix hydration error by setting session ID on client
        setSessionId(`VC-${Math.floor(Math.random() * 90000) + 10000}`);

        // Manual initialization preferred for hackathon demo impact
        logStatus("SYSTEM READY: AWAITING INITIALIZATION");

        return () => {
            if (recognizerRef.current) {
                recognizerRef.current.close();
            }
        };
    }, []);

    const toggleRecording = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const processIntent = async (text: string) => {
        setIsProcessing(true);
        logStatus("INITIATING INTENT EXTRACTION");
        try {
            const { parseVoiceIntentWithGemini } = await import("@/actions/voice-intent");
            const result = await parseVoiceIntentWithGemini(text);
            if (result.success && result.data) {
                setIntentData(result.data);
                logStatus("INTENT ANALYZED SUCCESSFULLY");
            } else {
                logStatus("ERROR: INTENT EXTRACTION FAILED");
            }
        } catch (error) {
            console.error(error);
            logStatus("ERROR: NEURAL CORE TIMEOUT");
        } finally {
            setIsProcessing(false);
        }
    };

    const speakSummary = () => {
        if (!intentData?.summary) return;
        const utterance = new SpeechSynthesisUtterance(intentData.summary);

        let tL = "en-IN";
        if (intentData.language === "hi") tL = "hi-IN";
        else if (intentData.language === "bn") tL = "bn-IN";
        else if (intentData.language) tL = intentData.language;

        utterance.lang = tL;

        // Populate voices (some browsers require this check)
        const voices = window.speechSynthesis.getVoices();

        // Exact match first, then language prefix match
        let v = voices.find(x => x.lang === tL);
        if (!v) v = voices.find(x => x.lang.startsWith(tL.split('-')[0]));

        if (v) {
            utterance.voice = v;
            logStatus(`TTS: USING VOICE [${v.name}] for ${tL}`);
        } else {
            logStatus(`TTS WARNING: NO NATIVE VOICE FOR ${tL}`);
        }

        utterance.pitch = 0.95;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const HighlightText = ({ text, highlightWords }: { text: string, highlightWords: string[] }) => {
        if (!text) return null;
        if (!highlightWords.length) return <>{text}</>;

        const pattern = new RegExp(`(${highlightWords.join('|')})`, 'gi');
        const parts = text.split(pattern);

        return (
            <>
                {parts.map((part, i) => (
                    pattern.test(part) ? (
                        <span key={i} className="bg-teal/20 text-teal font-bold px-1 rounded mx-0.5 border border-teal/10">
                            {part}
                        </span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                ))}
            </>
        );
    };

    const startRecording = async () => {
        try {
            const k = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
            const r = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;
            if (!k || !r) return logStatus("ERROR: CREDENTIALS MISSING");

            const sc = speechsdk.SpeechConfig.fromSubscription(k, r);
            const ac = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
            let rc: speechsdk.SpeechRecognizer;

            if (selectedLang === "auto") {
                logStatus("AUTO-DETECT (EN|HI|BN)");
                const adc = speechsdk.AutoDetectSourceLanguageConfig.fromLanguages(["en-IN", "hi-IN", "bn-IN"]);
                sc.setProperty(speechsdk.PropertyId.SpeechServiceConnection_LanguageIdMode, "Continuous");
                rc = new (speechsdk.SpeechRecognizer as any)(sc, ac, adc);
            } else {
                let tL = "en-IN";
                if (selectedLang === "hi") tL = "hi-IN";
                else if (selectedLang === "bn") tL = "bn-IN";

                logStatus(`MANUAL: ${tL}`);
                sc.speechRecognitionLanguage = tL;
                rc = new speechsdk.SpeechRecognizer(sc, ac);
            }

            recognizerRef.current = rc;

            rc.recognizing = (s, e) => {
                const txt = e.result.text;
                const clean = txt.replace(/start now/gi, "").replace(/over and out/gi, "").trim();
                if (isSessionActiveRef.current) setInterimTranscript(clean);
                if (txt.toLowerCase().includes("start now") && !isSessionActiveRef.current) logStatus("TRIGGER: START NOW");
            };

            rc.recognized = (s, e) => {
                if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
                    const raw = e.result.text;
                    const lang = e.result.language;
                    if (lang === "bn-IN") logStatus("DETECTED: BENGALI (NATIVE SCRIPT ACTIVE)");
                    else if (lang) logStatus(`LANG: ${lang} | ${raw.substring(0, 10)}...`);
                    const clean = raw.replace(/start now/gi, "").replace(/over and out/gi, "").trim();

                    if (raw.toLowerCase().includes("start now")) {
                        logStatus("SESSION STARTED");
                        isSessionActiveRef.current = true;
                        setIsSessionActive(true);
                        setTranscript(clean);
                        setInterimTranscript("");
                        if (!clean) return;
                    }

                    if (isSessionActiveRef.current && clean && !raw.toLowerCase().includes("start now")) {
                        setTranscript(p => (p + " " + clean).trim());
                    }

                    if (raw.toLowerCase().includes("over and out") && isSessionActiveRef.current) {
                        logStatus("TERMINAL TRIGGER detected");
                        isSessionActiveRef.current = false;
                        setIsSessionActive(false);

                        // Hackathon Polish: Add artificial analysis delay for impact
                        setIsAnalyzing(true);
                        logStatus("NEURAL CORE: ANALYZING INTENT...");

                        setTimeout(() => {
                            setIsAnalyzing(false);
                            setTranscript(p => {
                                const full = (p.includes(clean) ? p : p + " " + clean).trim();
                                processIntent(full);
                                return full;
                            });
                        }, 1500);
                    }
                }
            };

            await navigator.mediaDevices.getUserMedia({ audio: true });
            rc.startContinuousRecognitionAsync(() => {
                setIsRecording(true);
                logStatus("SYSTEM ACTIVE");
            }, e => {
                logStatus(`ERROR: ${e}`);
            });
        } catch (e) {
            logStatus("ERROR: MIC FAILED");
        }
    };

    const stopRecording = () => {
        if (recognizerRef.current) {
            recognizerRef.current.stopContinuousRecognitionAsync(
                () => {
                    setIsRecording(false);
                    setIsSessionActive(false); // Reset session state
                    isSessionActiveRef.current = false; // Reset Ref
                    setInterimTranscript("");
                    logStatus("SESSION TERMINATED");
                },
                (err) => {
                    console.error(err);
                    logStatus(`ERROR STOPPING: ${err}`);
                }
            );
        }
    };

    return (
        <div className="w-full h-full flex justify-center py-6 px-4">
            {/* Main Terminal Container */}
            <div className="w-full max-w-5xl bg-paper border border-carbon shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden">

                {/* Global Header */}
                <header className="flex flex-col md:flex-row items-center justify-between border-b border-carbon px-6 py-4 bg-paper gap-4 md:gap-0">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-1 text-[10px] font-mono font-bold text-gray-400 hover:text-teal transition-colors border border-gray-100 px-2 py-1 uppercase tracking-widest mr-4 group"
                        >
                            <span className="material-symbols-outlined text-[14px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                            Dashboard
                        </Link>
                        <span className="material-symbols-outlined text-teal text-xl">analytics</span>
                        <h1 className="font-mono font-bold text-lg tracking-tighter uppercase text-carbon">Mystic Maitri | Voice Core</h1>
                    </div>

                    <div className="flex items-center gap-4 text-carbon font-mono text-[10px] sm:text-xs">
                        {isRecording ? (
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full animate-pulse ${isSessionActive ? 'bg-red-600' : 'bg-teal'}`}></span>
                                <span className={`font-bold ${isSessionActive ? 'text-red-600' : 'text-teal'}`}>
                                    {isSessionActive ? 'STATUS: RECORDING' : 'LISTENING: AWAITING TRIGGER'}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                                <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                                <span className="font-bold">STATUS: IDLE</span>
                            </div>
                        )}
                        <span className="hidden md:inline">|</span>
                        <div className="flex items-center gap-1 hidden md:flex">
                            <span className="material-symbols-outlined text-[14px]">mic</span>
                            <span>MIC INPUT</span>
                        </div>
                    </div>
                </header>

                {/* Session Info Sub-header */}
                <div className="bg-carbon text-paper px-6 py-2 flex justify-between font-mono text-[10px] tracking-widest uppercase items-center">
                    <span>SESSION: {sessionId || "INITIALIZING..."}</span>
                    <span className="text-teal">NODE: CLINIC-02</span>
                </div>

                <div className="p-4 md:p-8 space-y-8 bg-paper">

                    {/* Recording Button & Language Switcher */}
                    <div className="flex flex-col md:flex-row gap-6 items-stretch">

                        <div className="w-full md:w-1/3 flex flex-col gap-4">
                            {/* Language Selector */}
                            <div className="flex items-center gap-2 border border-carbon p-2 bg-gray-50">
                                <span className="material-symbols-outlined text-xs text-gray-500">language</span>
                                <select
                                    value={selectedLang}
                                    onChange={(e) => setSelectedLang(e.target.value)}
                                    disabled={isRecording}
                                    className="bg-transparent font-mono text-[10px] uppercase font-bold outline-none flex-1 text-carbon cursor-pointer"
                                    title="Transcription Language"
                                >
                                    <option value="auto">Auto-Detect</option>
                                    <option value="en">English (India)</option>
                                    <option value="hi">Hindi (Native Script)</option>
                                    <option value="bn">Bengali (Native Script)</option>
                                </select>
                            </div>

                            {/* Recording Button */}
                            <button
                                onClick={toggleRecording}
                                disabled={isProcessing}
                                className={`flex-1 flex flex-col justify-center items-center py-6 px-4 border border-carbon transition-colors group ${isSessionActive
                                    ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                                    : isRecording
                                        ? "bg-teal/5 hover:bg-teal/10 text-teal border-teal/20"
                                        : "bg-white hover:bg-carbon hover:text-white text-carbon"
                                    } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <span className={`material-symbols-outlined text-4xl mb-4 ${isRecording ? "animate-pulse" : "group-hover:scale-110 transition-transform"}`}>
                                    {isSessionActive ? "mic" : isRecording ? "hearing" : "mic_none"}
                                </span>
                                <span className="font-mono font-bold tracking-widest uppercase text-xs text-center">
                                    {isSessionActive ? "Active Session" : isRecording ? "Listening" : "Initialize Audio"}
                                </span>
                                <span className="font-display text-[10px] opacity-50 mt-2 text-center">
                                    {isSessionActive ? "Say 'Over and Out' to end" : isRecording ? "Say 'Start Now' to begin" : "Click to establish feed"}
                                </span>
                            </button>
                        </div>

                        {/* Waveform container */}
                        <div className="w-full md:w-2/3 border border-carbon bg-white flex items-center justify-center relative min-h-[160px]">
                            <div className="absolute top-2 left-4 font-mono text-[10px] font-bold text-gray-400 tracking-widest">
                                AUDIO STREAM {isRecording ? "(LIVE)" : "(OFFLINE)"}
                            </div>

                            {/* Visual Waveform Animation */}
                            {!isRecording ? (
                                <div className="flex flex-col items-center justify-center h-24 mb-4">
                                    <button
                                        onClick={startRecording}
                                        className="h-16 w-16 rounded-full bg-teal text-paper flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all animate-bounce"
                                    >
                                        <span className="material-symbols-outlined text-3xl">mic</span>
                                    </button>
                                    <span className="text-[10px] font-mono font-bold text-teal mt-2 animate-pulse tracking-widest">TAP TO INITIALIZE MATRIX</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 h-24 px-6 mb-4">
                                    {Array.from({ length: 40 }).map((_, i) => {
                                        const minHeight = isRecording ? 15 : 4;
                                        const variation = isRecording ? Math.random() * 85 : 0;
                                        const colorClass = isSessionActive ? 'bg-amber-500' : isRecording ? 'bg-teal' : 'bg-gray-200';
                                        const animationDelay = `${i * 0.05}s`;
                                        return (
                                            <div
                                                key={i}
                                                className={`w-1.5 rounded-full transition-all duration-150 ${colorClass} ${isRecording ? 'animate-[pulse_1.5s_infinite]' : ''}`}
                                                style={{
                                                    height: `${minHeight + variation}%`,
                                                    animationDelay: animationDelay,
                                                    opacity: 0.7 + (Math.random() * 0.3)
                                                }}
                                            ></div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Level Indicator removed - handled by footer StatusTicker */}
                        </div>

                    </div>

                    {/* Transcription Stream */}
                    <div className="flex flex-col border border-carbon min-h-[250px] bg-white">
                        <div className="bg-carbon/5 border-b border-carbon/10 px-4 py-2 font-serif text-lg italic text-carbon flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <span>TRANSCRIPT</span>
                                {intentData?.language && (
                                    <span className="px-2 py-0.5 bg-teal/10 text-teal font-mono text-[9px] font-bold uppercase border border-teal/20 rounded">
                                        Detect: {intentData.language === 'hi' ? 'Hindi' : intentData.language === 'bn' ? 'Bengali' : 'English'}
                                    </span>
                                )}
                            </div>
                            {isRecording && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono uppercase bg-red-600 text-white px-2 py-0.5 animate-pulse">Live {selectedLang === 'auto' ? 'Detect' : selectedLang}</span>
                                </div>
                            )}
                        </div>
                        <div className="p-6 font-mono text-base md:text-lg leading-relaxed text-carbon flex-1 overflow-y-auto max-h-[400px]">
                            {transcript ? (
                                <HighlightText
                                    text={transcript}
                                    highlightWords={[
                                        ...(intentData?.intent ? [intentData.intent] : []),
                                        ...(intentData?.specialty ? [intentData.specialty] : []),
                                        'pneumonia', 'fever', 'chest', 'urgent', 'medication', 'injection', 'surgery', 'patient', 'doctor',
                                        'blood', 'pressure', 'heart', 'lungs', 'breath', 'pain', 'cough', 'diagnosis', 'treatment', 'prescription',
                                        'জ্বর', 'কাশি', 'ব্যাথা', 'ডাক্তার', 'ওষুধ', 'নিশ্বাস', 'বুক', 'সার্জারি', 'রোগী'
                                    ]}
                                />
                            ) : (
                                <span className="opacity-20 italic">Awaiting neural input stream...</span>
                            )}
                            {interimTranscript && (
                                <span className="text-teal/40 italic ml-1">{interimTranscript}</span>
                            )}
                        </div>
                    </div>

                    {/* Implementation Timeline */}
                    <div className="hidden md:flex justify-between items-center px-12 py-4 border-y border-gray-100 bg-gray-50/30">
                        {[
                            { step: "01", label: "Voice Input", active: isRecording },
                            { step: "02", label: "Sync Matrix", active: isSessionActive },
                            { step: "03", label: "Intent Logic", active: isAnalyzing || isProcessing },
                            { step: "04", label: "Workflow", active: !!intentData }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 group">
                                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border ${item.active ? 'bg-carbon text-paper border-carbon' : 'text-gray-300 border-gray-100'}`}>
                                    {item.step}
                                </span>
                                <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${item.active ? 'text-carbon' : 'text-gray-300'}`}>
                                    {item.label}
                                </span>
                                {idx < 3 && <div className={`w-8 h-[1px] ${item.active ? 'bg-carbon' : 'bg-gray-100'}`}></div>}
                            </div>
                        ))}
                    </div>

                    {/* Insights & Logs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Extracted Intent */}
                        <div className="border border-carbon bg-white flex flex-col">
                            <div className="bg-carbon/5 border-b border-carbon/10 px-4 py-2 font-serif text-base italic text-carbon flex justify-between items-center">
                                <span>INTENT EXTRACTION</span>
                                {intentData && (
                                    <button
                                        onClick={speakSummary}
                                        className="material-symbols-outlined text-teal hover:scale-110 transition-transform cursor-pointer"
                                        title="Speak Out"
                                    >
                                        volume_up
                                    </button>
                                )}
                            </div>
                            <div className="p-4 space-y-3 font-mono text-sm relative">
                                {(isProcessing || isAnalyzing) && (
                                    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10 backdrop-blur-[2px]">
                                        <div className="flex gap-1 mb-3">
                                            <span className="h-4 w-1 bg-teal animate-[bounce_1s_infinite]"></span>
                                            <span className="h-6 w-1 bg-teal animate-[bounce_1.2s_infinite]"></span>
                                            <span className="h-4 w-1 bg-teal animate-[bounce_0.8s_infinite]"></span>
                                        </div>
                                        <span className="text-[10px] tracking-[0.2em] font-mono font-bold text-carbon animate-pulse">
                                            {isAnalyzing ? "NEURAL ANALYSIS IN PROGRESS" : "EXTRACTING CLINICAL DATA"}
                                        </span>
                                    </div>
                                )}

                                {intentData ? (
                                    <>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 text-carbon">
                                            <span className="text-gray-400 text-[10px] uppercase font-bold">Language</span>
                                            <span className="font-bold text-teal uppercase">{intentData.language || "Detected"}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 text-carbon">
                                            <span className="text-gray-400 text-[10px] uppercase font-bold">Intent</span>
                                            <span className="font-bold text-teal">{intentData.intent}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 text-carbon">
                                            <span className="text-gray-400 text-[10px] uppercase font-bold">Specialty</span>
                                            <span className="font-bold">{intentData.specialty}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-2 text-carbon">
                                            <span className="text-gray-400 text-[10px] uppercase font-bold">Priority</span>
                                            <span className={`font-bold ${intentData.priority === 'URGENT' ? 'text-red-500' : 'text-carbon'}`}>
                                                {intentData.priority}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2 pt-2">
                                            <span className="text-gray-400 text-[10px] uppercase font-bold">Clinical Summary</span>
                                            <p className="text-xs leading-relaxed italic text-carbon/80 bg-gray-50 p-2 border-l-2 border-teal">
                                                "{intentData.summary}"
                                            </p>
                                        </div>
                                        {intentData.instructions && (
                                            <div className="flex flex-col gap-2 pt-2">
                                                <span className="text-gray-400 text-[10px] uppercase font-bold">Patient Instructions</span>
                                                <p className="text-[10px] leading-relaxed text-carbon/70 bg-gray-50 p-2 border-l-2 border-teal">
                                                    {intentData.instructions}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-2 pt-2 pb-4">
                                            <div className="flex justify-between items-center text-carbon pt-3 border-t border-gray-100">
                                                <span className="text-gray-400 text-[10px] uppercase font-bold">Confidence</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-teal"
                                                            style={{ width: `${intentData.confidence * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="font-mono text-[10px] font-bold">
                                                        {(intentData.confidence * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Workflow Queue Action */}
                                        <button
                                            className="w-full bg-carbon text-paper py-3 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-teal transition-colors flex items-center justify-center gap-2 group"
                                            onClick={() => {
                                                logStatus("WORKFLOW INITIATED: SYNCED TO QUEUE");
                                                router.push("/dashboard/workflow");
                                            }}
                                        >
                                            <span>Send to Workflow Queue</span>
                                            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                        </button>

                                        {/* Model Metadata */}
                                        <div className="pt-4 flex justify-between items-center opacity-30">
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px]">model_training</span>
                                                <span className="text-[8px] font-mono font-bold uppercase">LLM: Gemini-2.0-Flash</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px]">transcribe</span>
                                                <span className="text-[8px] font-mono font-bold uppercase">STT: Azure Speech SDK</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex items-center justify-center opacity-30 italic text-carbon min-h-[180px]">
                                        {isProcessing ? "" : "Awaiting neural data..."}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Event Logs */}
                        <div className="border border-carbon bg-white flex flex-col">
                            <div className="bg-carbon/5 border-b border-carbon/10 px-4 py-2 font-serif text-base italic text-carbon flex justify-between">
                                SYSTEM LOGS
                                {statusLogs.length > 0 && <span className="font-mono text-xs opacity-50 not-italic pt-1">{statusLogs.length} events</span>}
                            </div>
                            <div className="p-4 font-mono text-[9px] text-gray-500 space-y-2 h-[180px] overflow-y-auto custom-scrollbar">
                                {statusLogs.length === 0 ? (
                                    <div className="h-full flex items-center justify-center italic opacity-30">No system events logged.</div>
                                ) : (
                                    statusLogs.slice().reverse().map((log, index) => (
                                        <div key={index} className="flex justify-between border-b border-gray-50 pb-1 w-full gap-4">
                                            <span className="shrink-0 font-bold">{log.time}</span>
                                            <span className={`text-right ${log.msg.includes("ERROR") ? "text-red-500 font-bold" : (log.msg.includes("ACTIVE") || log.msg.includes("SUCCESS") ? "text-teal font-bold" : "text-carbon")}`}>
                                                {log.msg}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
