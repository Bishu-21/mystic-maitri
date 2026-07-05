export default function SystemTicker() {
    return (
        <footer className="fixed bottom-0 left-0 w-full bg-paper border-t border-carbon py-2 overflow-hidden whitespace-nowrap z-[100]">
            <div className="flex items-center gap-8 animate-marquee font-mono text-sm tracking-[0.2em] font-bold uppercase">
                <span className="flex-shrink-0 text-teal">[UPTIME: 99.9%]</span>
                <span className="flex-shrink-0 text-carbon">[PENDING ACTIONS: 14]</span>
                <span className="flex-shrink-0 text-carbon">[LAST SYNC: 09:41]</span>
                <span className="flex-shrink-0 text-carbon">[VOICE SESSIONS: 3]</span>
                <span className="flex-shrink-0 text-carbon">[DOCUMENTS PROCESSED: 27]</span>
                <span className="flex-shrink-0 text-carbon opacity-30">[LOCATION: DATA_CENTER_OMEGA]</span>
                <span className="flex-shrink-0 text-carbon opacity-30">[ENCRYPTION: AES-256-GCM]</span>
                <span className="flex-shrink-0 text-carbon opacity-30">[PROTOCOL: SECURE_LINK_v2]</span>

                {/* Repeat for seamless scroll effect */}
                <span className="flex-shrink-0 text-teal">[UPTIME: 99.9%]</span>
                <span className="flex-shrink-0 text-carbon">[PENDING ACTIONS: 14]</span>
                <span className="flex-shrink-0 text-carbon">[LAST SYNC: 09:41]</span>
                <span className="flex-shrink-0 text-carbon">[VOICE SESSIONS: 3]</span>
                <span className="flex-shrink-0 text-carbon">[DOCUMENTS PROCESSED: 27]</span>
                <span className="flex-shrink-0 text-carbon opacity-30">[LOCATION: DATA_CENTER_OMEGA]</span>
                <span className="flex-shrink-0 text-carbon opacity-30">[ENCRYPTION: AES-256-GCM]</span>
                <span className="flex-shrink-0 text-carbon opacity-30">[PROTOCOL: SECURE_LINK_v2]</span>
            </div>
        </footer>
    );
}
