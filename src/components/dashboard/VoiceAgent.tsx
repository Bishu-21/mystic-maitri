"use client";

import { useState, useRef, useEffect } from "react";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import { parseVoiceIntentWithGemini } from "@/actions/voice-intent";
import { useRouter } from "next/navigation";

type VoiceState = "IDLE" | "LISTENING" | "PROCESSING" | "SUCCESS" | "ERROR";

export default function VoiceAgent() {
    const [state, setState] = useState<VoiceState>("IDLE");
    const [transcript, setTranscript] = useState("");
    const [intent, setIntent] = useState<any>(null);
    const recognizerRef = useRef<speechsdk.SpeechRecognizer | null>(null);
    const router = useRouter();

    const startSession = async () => {
        setState("LISTENING");
        setTranscript("");
        setIntent(null);

        try {
            const k = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
            const r = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;
            if (!k || !r) throw new Error("Credentials missing");

            const speechConfig = speechsdk.SpeechConfig.fromSubscription(k, r);
            speechConfig.speechRecognitionLanguage = "en-IN";
            const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();

            const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
            recognizerRef.current = recognizer;

            recognizer.recognized = (s, e) => {
                if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
                    setTranscript(prev => (prev + " " + e.result.text).trim());
                }
            };

            recognizer.startContinuousRecognitionAsync();
        } catch (err) {
            console.error(err);
            setState("ERROR");
        }
    };

    const stopSession = async () => {
        if (!recognizerRef.current) return;

        setState("PROCESSING");
        recognizerRef.current.stopContinuousRecognitionAsync(() => {
            recognizerRef.current?.close();
            recognizerRef.current = null;
            handleAnalysis();
        });
    };

    const speakResponse = (text: string, lang?: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        // Auto-detect language for TTS if possible or default to English
        if (lang === "bn") utterance.lang = "bn-IN";
        else if (lang === "hi") utterance.lang = "hi-IN";
        else utterance.lang = "en-IN";

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const handleAnalysis = async () => {
        if (!transcript) {
            setState("IDLE");
            return;
        }

        setState("PROCESSING");
        try {
            const result = await parseVoiceIntentWithGemini(transcript);
            if (result.success) {
                setIntent(result.data);
                setState("SUCCESS");
                // 🗣️ AUTO-SPEAK THE AI RESPONSE
                if (result.data.verbal_response) {
                    speakResponse(result.data.verbal_response, result.data.language);
                }
            } else {
                setState("ERROR");
            }
        } catch (err) {
            setState("ERROR");
        }
    };

    return (
        <div className="w-full h-full min-h-[320px] bg-paper border border-carbon flex flex-col relative overflow-hidden group">
            {/* Header / Status */}
            <div className="border-b border-carbon px-4 py-2 flex justify-between items-center font-mono text-[10px] tracking-widest uppercase bg-carbon/5">
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${state === "LISTENING" ? "bg-red-500 animate-pulse" : state === "PROCESSING" ? "bg-amber-500 animate-spin" : state === "SUCCESS" ? "bg-teal" : "bg-gray-400"}`}></span>
                    <span className="font-bold">LIVE CLINICAL AGENT</span>
                </div>
                <span>NODE_STATUS: {state}</span>
            </div>

            {/* Visual Area / Waveform */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-paper relative">
                {state === "IDLE" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full border border-carbon flex items-center justify-center bg-white group-hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all">
                            <span className="material-symbols-outlined text-4xl">mic</span>
                        </div>
                        <button
                            onClick={startSession}
                            className="font-mono text-xs font-bold border border-carbon px-6 py-2 bg-paper hover:bg-carbon hover:text-paper transition-all uppercase tracking-widest"
                        >
                            [ START VOICE SESSION ]
                        </button>
                        <p className="text-[10px] font-mono opacity-40 uppercase">Awaiting neural input...</p>
                    </div>
                )}

                {state === "LISTENING" && (
                    <div className="w-full flex flex-col items-center gap-8">
                        {/* CSS Waveform */}
                        <div className="flex items-end gap-1 h-12">
                            {[...Array(24)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-red-500 rounded-full animate-wave"
                                    style={{
                                        height: `${20 + Math.random() * 80}%`,
                                        animationDelay: `${i * 0.05}s`
                                    }}
                                ></div>
                            ))}
                        </div>
                        <div className="text-center space-y-2">
                            <p className="font-mono text-xs font-bold text-red-600 animate-pulse tracking-[0.2em]">● LISTENING...</p>
                            <p className="font-serif italic text-sm opacity-60">"{transcript || "Establishing stream..."}"</p>
                        </div>
                        <button
                            onClick={stopSession}
                            className="font-mono text-[10px] font-bold border border-red-200 px-6 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest mt-4"
                        >
                            [ END & ANALYZE ]
                        </button>
                    </div>
                )}

                {state === "PROCESSING" && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-2 border-teal border-t-transparent rounded-full animate-spin"></div>
                            <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-teal">psychology</span>
                        </div>
                        <p className="font-mono text-xs font-bold animate-pulse text-teal tracking-[0.2em]">NEURAL_CORE: PROCESSING INTENT</p>
                    </div>
                )}

                {state === "SUCCESS" && intent && (
                    <div className="w-full h-full flex flex-col gap-4 animate-fade-in relative">
                        {/* Interactive AI Bubble */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 bg-teal rounded-full animate-pulse"></span>
                                <span className="font-mono text-[8px] font-bold text-teal uppercase tracking-widest">Mystic AI responding...</span>
                            </div>
                            <div className="bg-carbon text-paper p-4 border border-carbon shadow-[4px_4px_0px_0px_rgba(20,184,166,0.3)]">
                                <p className="font-serif italic text-sm leading-relaxed">
                                    "{intent.verbal_response}"
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 mt-2 overflow-y-auto custom-scrollbar pr-2 flex-1">
                            <div className="flex items-start justify-between border-l-4 border-carbon bg-carbon/5 p-3">
                                <div className="space-y-1">
                                    <p className="font-mono text-[8px] text-gray-400 font-bold uppercase tracking-widest">Parsed Intent</p>
                                    <h4 className="font-mono font-bold text-xs uppercase">{intent.intent}</h4>
                                    <p className="text-[10px] italic text-carbon/70">{intent.summary}</p>
                                </div>
                                <span className="material-symbols-outlined text-teal text-xl">verified</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="border border-carbon/10 p-2 bg-gray-50 flex flex-col justify-center">
                                    <span className="font-mono text-[8px] text-gray-400 uppercase">Priority</span>
                                    <span className={`font-mono text-[10px] font-bold ${intent.priority === 'URGENT' ? 'text-red-500' : 'text-teal'}`}>{intent.priority}</span>
                                </div>
                                <div className="border border-carbon/10 p-2 bg-gray-50 flex flex-col justify-center">
                                    <span className="font-mono text-[8px] text-gray-400 uppercase">Specialty</span>
                                    <span className="font-mono text-[10px] font-bold truncate">{intent.specialty}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                            <button
                                onClick={() => startSession()}
                                className="flex-1 bg-teal text-paper py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-carbon transition-all flex items-center justify-center gap-2 border border-carbon"
                            >
                                <span className="material-symbols-outlined text-sm">mic</span>
                                <span>Continue Chat</span>
                            </button>
                            <button
                                onClick={() => router.push("/dashboard/workflow")}
                                className="flex-1 bg-carbon text-paper py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-teal transition-all flex items-center justify-center gap-2"
                            >
                                <span>Queue</span>
                                <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                            </button>
                        </div>
                        <button
                            onClick={() => setState("IDLE")}
                            className="text-center font-mono text-[8px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity mt-2"
                        >
                            [ Reset Session ]
                        </button>
                    </div>
                )}

                {state === "ERROR" && (
                    <div className="flex flex-col items-center gap-4 text-red-600">
                        <span className="material-symbols-outlined text-4xl">warning</span>
                        <p className="font-mono text-xs font-bold uppercase tracking-widest">SYSTEM_FAILURE</p>
                        <button
                            onClick={() => setState("IDLE")}
                            className="font-mono text-[10px] border border-red-600 px-4 py-1 hover:bg-red-600 hover:text-white transition-all uppercase"
                        >
                            Retry
                        </button>
                    </div>
                )}
            </div>

            {/* Footer / Neural Indicator */}
            <div className="border-t border-carbon p-3 flex items-center justify-between font-mono text-[8px] text-gray-400 bg-paper">
                <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`w-1 h-3 ${state === 'LISTENING' ? 'bg-red-500 animate-pulse' : 'bg-carbon/10'}`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                    </div>
                    <span>MULTILINGUAL_MATRIX: ENABLED</span>
                </div>
                <span>GEMINI_FLASH_2.5_NATIVE</span>
            </div>

            <style jsx>{`
                @keyframes wave {
                    0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
                    50% { transform: scaleY(1.2); opacity: 1; }
                }
                .animate-wave {
                    animation: wave 1s infinite ease-in-out;
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
