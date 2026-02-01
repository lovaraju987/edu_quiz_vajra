"use client";

import Link from "next/link";

interface NavbarProps {
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
    showSearch?: boolean;
}

export default function Navbar({ searchQuery = "", setSearchQuery, showSearch = false }: NavbarProps) {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur-md shadow-sm py-1">
            <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-6">
                <div className="flex-1 flex justify-start">
                    {showSearch && setSearchQuery ? (
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="flex items-center gap-4 bg-slate-100/80 px-5 py-2.5 rounded-2xl border border-slate-200 focus-within:border-blue-600 focus-within:bg-white transition-all w-full max-w-[500px]"
                        >
                            <div className="text-blue-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-800"
                                placeholder="Search Subjects (Science, GK, Telugu)..."
                            />
                        </form>
                    ) : (
                        <div></div>
                    )}
                </div>

                <nav className="hidden xl:flex items-center gap-8 pl-12">
                    <Link href="/about" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">About Us</Link>
                    <Link href="/associates" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Associates</Link>
                    <Link href="/programs" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Programs</Link>
                    <Link href="/scholarships" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Scholarships</Link>
                    <Link href="/events" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Events</Link>
                    <Link href="/winners" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Winners</Link>
                    <Link href="/enquiry" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Enquiry</Link>
                </nav>
            </div>
        </header>
    );
}
