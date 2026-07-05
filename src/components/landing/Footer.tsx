import Link from "next/link";
import { Activity } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/10 pt-20 pb-12 bg-brand-background">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-white font-bold text-xl tracking-tight">Medcify</span>
                        </div>
                        <p className="text-slate-400 max-w-sm mb-6">
                            Empowering the last-mile healthcare infrastructure with Silicon Valley grade AI and logistics intelligence.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors text-slate-400 hover:text-emerald-400">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors text-slate-400 hover:text-emerald-400">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">OCR Engine</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Forecasting API</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Distributor Sync</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Security</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Case Studies</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Privacy</Link></li>
                            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© 2024 Medcify AI Systems Inc. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-slate-300 transition-colors">Status</Link>
                        <Link href="#" className="hover:text-slate-300 transition-colors">Cookies</Link>
                        <Link href="#" className="hover:text-slate-300 transition-colors">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
