"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signInWithEmail, signUpWithEmail } from "@/actions/auth";
import { signInWithGoogle } from "@/lib/appwrite/api";

type AuthMode = "login" | "signup";
type AccessRole = "Clinician" | "Pharmacist" | "Admin" | "Operations";

export default function AuthPage() {
    const router = useRouter();

    // UI State
    const [authMode, setAuthMode] = useState<AuthMode>("login");
    const [role, setRole] = useState<AccessRole>("Clinician");

    // Form State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isVerificationSent, setIsVerificationSent] = useState(false);

    // Real-time Clock State
    const [mounted, setMounted] = useState(false);
    const [time, setTime] = useState("");

    useEffect(() => {
        setMounted(true);
        const updateTime = () => setTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }));
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRoleSelect = (selectedRole: AccessRole) => {
        setRole(selectedRole);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMessage("");

        if (authMode === "signup" && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append("email", formData.email);
            data.append("password", formData.password);

            if (authMode === "signup") {
                data.append("name", formData.name);
                // In a real app we might pass the role down, but our actions currently do not expect it.
                // We are satisfying the UI specification for the role picker here.

                const result = await signUpWithEmail(data);
                if (result?.error) {
                    setError(result.error);
                } else {
                    setIsVerificationSent(true);
                    setSuccessMessage("System ID Provisioned. Please verify your institutional email.");
                }
            } else {
                const result = await signInWithEmail(data);
                if (result?.error) {
                    setError(result.error);
                } else {
                    window.location.href = "/dashboard";
                    return;
                }
            }
        } catch (err: unknown) {
            console.error("Auth Error:", err);
            setError(err instanceof Error ? err.message : "System Exception: Authorization failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error(err);
            setError("Google Authentication failed.");
        }
    };

    return (
        <div className="min-h-screen bg-paper bg-grid flex flex-col font-mono text-carbon antialiased relative">

            {/* Minimalist Top Banner (Consistent with landing) */}
            <div className="w-full bg-carbon text-paper border-b border-carbon z-50">
                <div className="container mx-auto px-4 py-2">
                    <p className="text-center text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-paper/80">
                        MYSTIC MAITRI | BRAINWARE AI HACKATHON 2026 | POWERED BY AZURE + GEMINI
                    </p>
                </div>
            </div>

            {/* Header */}
            <header className="z-10 flex items-center justify-between border-b border-carbon bg-paper/90 backdrop-blur-sm px-6 py-4 md:px-8 md:py-6">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="size-6 bg-carbon flex items-center justify-center text-paper group-hover:bg-teal transition-colors">
                        <span className="material-symbols-outlined text-sm">shield_lock</span>
                    </div>
                    <h1 className="text-lg md:text-xl font-bold tracking-tighter uppercase text-carbon">MYSTIC</h1>
                </Link>
                <div className="font-mono text-[10px] uppercase tracking-widest text-carbon/60 hidden md:block">
                    v4.2.0 // auth_node_01
                </div>
            </header>

            {/* Main Content (Split Screen Desktop, Stacked Mobile) */}
            <main className="flex-grow flex flex-col md:flex-row pb-16 md:pb-12 h-auto">

                {/* Left Panel: Manifesto */}
                <div className="w-full md:w-1/2 p-8 md:p-16 border-b md:border-b-0 md:border-r border-carbon flex flex-col justify-between bg-paper/80 backdrop-blur-sm">
                    <div className="space-y-12">
                        <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl italic font-bold leading-[0.9] tracking-tight text-carbon">
                            Secure<br />Healthcare<br />Intelligence.
                        </h2>
                        <p className="max-w-md text-sm leading-relaxed uppercase tracking-tight text-carbon/80">
                            Mystic Maitri operates as a human-authorized clinical coordination layer.
                            All AI-generated actions require explicit verification before execution.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-12 mb-8 md:mb-0">
                        <div className="border border-carbon px-3 py-1.5 text-[10px] font-bold bg-paper">
                            [MULTIMODAL INPUT VERIFIED]
                        </div>
                        <div className="border border-carbon px-3 py-1.5 text-[10px] font-bold bg-paper">
                            [HUMAN-IN-THE-LOOP]
                        </div>
                        <div className="border border-carbon px-3 py-1.5 text-[10px] font-bold bg-paper">
                            [FHIR DATA ENABLED]
                        </div>
                    </div>
                </div>

                {/* Right Panel: Access Portal */}
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col bg-paper relative">

                    <div className="max-w-md w-full mx-auto flex-grow flex flex-col pt-4 md:pt-0 pb-16 min-h-[600px]">

                        {/* Status / Feedback Area */}
                        {(error || successMessage) && (
                            <div className={`mb-8 p-4 border text-[10px] font-bold uppercase tracking-wide ${error ? 'border-red-500 text-red-600 bg-red-50' : 'border-[#4B7F78] text-[#4B7F78] bg-[#4B7F78]/5'}`}>
                                {error ? `[ERROR] ${error}` : `[SUCCESS] ${successMessage}`}
                            </div>
                        )}

                        {isVerificationSent ? (
                            <div className="flex flex-col flex-grow items-center justify-center space-y-8 text-center animate-fade-in my-auto">
                                <span className="material-symbols-outlined text-6xl text-carbon">mark_email_read</span>
                                <div>
                                    <h2 className="font-serif text-3xl font-bold text-carbon mb-2">Verify Credential.</h2>
                                    <p className="text-sm text-carbon/70 max-w-sm mx-auto uppercase tracking-wide mt-4">
                                        An authorization manifest has been dispatched to <br /><span className="font-bold text-carbon text-lg block mt-2">{formData.email}</span><br />Acknowledge to establish session link.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setAuthMode("login");
                                        setIsVerificationSent(false);
                                        setSuccessMessage("");
                                    }}
                                    className="uppercase tracking-[0.2em] text-[10px] font-bold hover:underline transition-all mt-4 text-[#4B7F78]"
                                >
                                    [ RETURN TO LOGIN ]
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full flex-grow relative">
                                {/* Tab Switcher */}
                                <div className="flex items-center gap-4 mb-10 border-b border-carbon/20 pb-4">
                                    <button
                                        onClick={() => { setAuthMode("login"); setError(""); }}
                                        className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${authMode === 'login' ? 'text-carbon' : 'text-carbon/40 hover:text-carbon/70'}`}
                                    >
                                        [ LOGIN ]
                                    </button>
                                    <button
                                        onClick={() => { setAuthMode("signup"); setError(""); }}
                                        className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${authMode === 'signup' ? 'text-carbon' : 'text-carbon/40 hover:text-carbon/70'}`}
                                    >
                                        [ INITIALIZE ACCOUNT ]
                                    </button>
                                </div>

                                {/* Dynamic Header */}
                                <div className="mb-10">
                                    {authMode === "login" ? (
                                        <h3 className="text-xs font-bold tracking-[0.2em] text-carbon">SYSTEM ACCESS // LOGIN_V4.0</h3>
                                    ) : (
                                        <div className="space-y-4">
                                            <h3 className="font-serif text-4xl italic font-bold text-carbon mb-2">Join the Network.</h3>
                                            <div className="inline-block px-2 py-1 bg-carbon text-paper text-[10px] font-mono uppercase tracking-widest mt-2">
                                                SYSTEM_ID: GENERATING...
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Form */}
                                <form className="space-y-8 flex-grow flex flex-col justify-between" onSubmit={handleAuth}>

                                    <div className="space-y-6">
                                        {/* Sign Up Fields */}
                                        {authMode === "signup" && (
                                            <div className="group relative">
                                                <input
                                                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-carbon py-3 px-0 font-mono text-sm font-bold placeholder:text-carbon/30 focus:outline-none focus:ring-0 focus:border-carbon transition-colors"
                                                    id="name"
                                                    type="text"
                                                    placeholder="FULL NAME"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        )}

                                        {/* Common Fields */}
                                        <div className="group relative">
                                            <input
                                                className="w-full bg-transparent border-t-0 border-x-0 border-b border-carbon py-3 px-0 font-mono text-sm font-bold placeholder:text-carbon/30 focus:outline-none focus:ring-0 focus:border-carbon transition-colors"
                                                id="email"
                                                type="email"
                                                placeholder={authMode === "signup" ? "INSTITUTIONAL EMAIL" : "USER EMAIL"}
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="group relative">
                                            <input
                                                className="w-full bg-transparent border-t-0 border-x-0 border-b border-carbon py-3 px-0 font-mono text-sm font-bold placeholder:text-carbon/30 focus:outline-none focus:ring-0 focus:border-carbon transition-colors pr-16"
                                                id="password"
                                                type="password"
                                                placeholder="PASSWORD"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {authMode === "login" && (
                                                <button type="button" className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-carbon/50 hover:text-carbon transition-colors">
                                                    Reset
                                                </button>
                                            )}
                                        </div>

                                        {/* Confirm Password (Sign Up Only) */}
                                        {authMode === "signup" && (
                                            <div className="group relative">
                                                <input
                                                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-carbon py-3 px-0 font-mono text-sm font-bold placeholder:text-carbon/30 focus:outline-none focus:ring-0 focus:border-carbon transition-colors"
                                                    id="confirmPassword"
                                                    type="password"
                                                    placeholder="CONFIRM PASSWORD"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Role Selector */}
                                    <div className="space-y-4 pt-6">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-carbon/50">ASSIGNED ROLE</p>
                                        <div className="flex flex-wrap gap-2">
                                            {["Clinician", "Pharmacist", "Admin", "Operations"].map((r) => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => handleRoleSelect(r as AccessRole)}
                                                    className={`px-4 py-2 rounded-full border border-carbon text-[10px] font-bold uppercase transition-colors ${role === r ? 'bg-carbon text-paper' : 'bg-transparent text-carbon hover:bg-carbon/10'}`}
                                                >
                                                    [{r}]
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8 flex-grow flex flex-col justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-carbon text-paper rounded-full py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#4B7F78] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-8"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (authMode === "login" ? "[ AUTHENTICATE SESSION ]" : "[ REQUEST SYSTEM ACCESS ]")}
                                        </button>

                                        {/* Google OAuth Button */}
                                        <button
                                            type="button"
                                            onClick={handleGoogleAuth}
                                            disabled={loading}
                                            className="w-full bg-transparent border border-carbon text-carbon rounded-full py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-carbon hover:text-paper transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                                        >
                                            [ AUTHENTICATE VIA GOOGLE ]
                                        </button>

                                        {/* Technical Footer */}
                                        <div className="pt-6 text-center">
                                            <p className="text-[10px] leading-relaxed text-carbon/50 uppercase">
                                                All system actions are logged and auditable. <br />
                                                Unauthorized access is strictly prohibited under protocol 8.41-B.
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* System Footer Ticker (Fixed Bottom) */}
            <footer className="fixed bottom-0 left-0 w-full z-20 border-t border-carbon bg-paper/95 backdrop-blur px-4 md:px-8 py-2 md:py-3 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-carbon">[NODE STATUS: ONLINE]</span>
                    </div>
                    <span className="text-[10px] font-bold text-carbon/20 shrink-0">|</span>
                    <span className="text-[10px] font-bold text-carbon shrink-0">[AUTH SERVER: ACTIVE]</span>
                    <span className="text-[10px] font-bold text-carbon/20 shrink-0">|</span>
                    <span className="text-[10px] font-bold text-carbon shrink-0">[UPTIME: 99.9%]</span>
                    <span className="text-[10px] font-bold text-carbon/20 shrink-0">|</span>
                    <span className="text-[10px] font-bold text-carbon shrink-0">[ENCRYPTION: AES-256]</span>
                </div>
                <div className="hidden lg:flex shrink-0 pl-4 items-center gap-2">
                    <span className="material-symbols-outlined text-[12px] text-carbon">lock</span>
                    <span className="text-[10px] font-bold uppercase text-carbon">System_Time: {mounted ? time : "00:00:00"} IST</span>
                </div>
            </footer>
        </div>
    );
}
