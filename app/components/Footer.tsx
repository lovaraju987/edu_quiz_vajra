export default function Footer() {
    return (
        <footer className="py-3 bg-slate-900 border-t border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] relative overflow-hidden shrink-0">
            {/* Elegant Accent Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

            <div className="max-w-[1700px] mx-auto px-4 flex items-center justify-center relative z-10">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
                    © 2026 Edu Quiz Project
                    <span className="hidden md:inline text-slate-700">|</span>
                    <span className="text-slate-400">Promoting Academic Integrity & Growth</span>
                    <span className="w-1 h-1 rounded-full bg-purple-500 animate-pulse"></span>
                </p>
            </div>
        </footer>
    );
}
