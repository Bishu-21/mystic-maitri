"use client";

import { useState, useEffect, useRef } from "react";
import { getWorkflowCount } from "@/actions/workflow";

export default function StatusTicker() {
    const [uptime, setUptime] = useState(0);
    const [dbLevel, setDbLevel] = useState(0);
    const [pendingActions, setPendingActions] = useState(0);
    const [queuedDocs, setQueuedDocs] = useState(0);
    const [lastSync, setLastSync] = useState("");
    const [isScanning, setIsScanning] = useState(true);
    const [cacheStatus, setCacheStatus] = useState("ACTIVE");
    const [signalAlerts, setSignalAlerts] = useState(3);

    const startTimeRef = useRef(Date.now());

    useEffect(() => {
        // Init sync time
        setLastSync(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));

        // 1. Uptime Clock
        const uptimeInterval = setInterval(() => {
            setUptime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);

        // 2. Metric Sync (Real Redis Data)
        const syncMetrics = async () => {
            const count = await getWorkflowCount();
            setPendingActions(count);
            // Simulate queued docs as a fraction of total for variety
            setQueuedDocs(Math.ceil(count * 0.4));
            setSignalAlerts(prev => Math.max(1, prev + (Math.random() > 0.9 ? 1 : Math.random() > 0.9 ? -1 : 0)));
            setLastSync(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
        };

        syncMetrics();
        const syncInterval = setInterval(syncMetrics, 3000);

        // 3. REAL-TIME dB SENSING (Web Audio API)
        let audioContext: AudioContext | null = null;
        let analyzer: AnalyserNode | null = null;
        let stream: MediaStream | null = null;
        let animationFrame: number;

        const startAudioAnalysis = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                analyzer = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyzer);
                analyzer.fftSize = 256;

                const bufferLength = analyzer.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const updateDb = () => {
                    if (!analyzer) return;
                    analyzer.getByteFrequencyData(dataArray);

                    // Simple average volume
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / bufferLength;

                    // Convert to simple dB representation (0-100 range for UI)
                    const dB = Math.round((average / 255) * 100);
                    setDbLevel(dB);

                    animationFrame = requestAnimationFrame(updateDb);
                };
                updateDb();
            } catch (err) {
                console.error("Audio Ticker Analysis Error:", err);
            }
        };

        startAudioAnalysis();

        return () => {
            clearInterval(uptimeInterval);
            clearInterval(syncInterval);
            cancelAnimationFrame(animationFrame);
            if (stream) stream.getTracks().forEach(t => t.stop());
            if (audioContext) audioContext.close();
        };
    }, []);

    const formatUptime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}m ${sec}s`;
    };

    return (
        <>
            <footer className="fixed bottom-0 left-0 w-full bg-paper border-t border-carbon z-50 hidden md:block">
                <div className="px-6 py-2 flex items-center justify-between overflow-hidden">
                    <div className="font-mono text-[10px] tracking-wider uppercase flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <span className="text-gray-400">[</span>UPTIME: {formatUptime(uptime)}<span className="text-gray-400">]</span>
                        </span>
                        <span className="flex items-center gap-2 font-bold text-teal">
                            <span className="text-gray-400">[</span>PENDING ACTIONS: {pendingActions}<span className="text-gray-400">]</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="text-gray-400">[</span>VOICE STREAMS: 1<span className="text-gray-400">]</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="text-gray-400">[</span>DOCUMENTS QUEUED: {queuedDocs}<span className="text-gray-400">]</span>
                        </span>
                        <span className="flex items-center gap-2 text-amber-500 animate-pulse">
                            <span className="text-gray-400">[</span>SIGNAL ALERTS: {signalAlerts}<span className="text-gray-400">]</span>
                        </span>
                        <span className="flex items-center gap-2 text-teal font-bold">
                            <span className="text-gray-400">[</span>CACHE_STATUS: {cacheStatus}<span className="text-gray-400">]</span>
                        </span>
                        <span className="flex items-center gap-2 text-amber-600">
                            <span className="text-gray-400">[</span>AMBIENT: {dbLevel}dB<span className="text-gray-400">]</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="text-gray-400">[</span>LAST SYNC: {lastSync}<span className="text-gray-400">]</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-[9px] tracking-widest text-carbon/40">
                        <span className="animate-pulse">● SCANNING CHANNELS...</span>
                        <span className="font-bold">AES-256 SECURED</span>
                    </div>
                </div>
            </footer>

            {/* Mobile Footer */}
            <footer className="md:hidden sticky bottom-0 bg-carbon text-paper p-2 border-t border-carbon z-50">
                <div className="flex whitespace-nowrap gap-4 font-mono text-[9px] tracking-tight justify-between">
                    <div className="flex gap-3">
                        <span>[UPTIME: {formatUptime(uptime)}]</span>
                        <span>[LEVEL: {dbLevel}dB]</span>
                    </div>
                    <span className="text-teal font-bold">[SYNC: {lastSync}]</span>
                </div>
            </footer>
        </>
    );
}
