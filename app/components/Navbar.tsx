"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SEARCH_INDEX = [
    { name: "Private Schools Play", url: "/private-schools-play", keywords: ["school", "play", "kindergarten", "nursery"] },
    { name: "Private Schools Daycare", url: "/private-schools-daycare", keywords: ["daycare", "creche", "childcare"] },
    { name: "Private Schools Primary", url: "/private-schools-primary", keywords: ["primary", "elementary", "school"] },
    { name: "Private Schools Secondary", url: "/private-schools-secondary", keywords: ["secondary", "high school", "ssc"] },
    { name: "Tuition Centers", url: "/tuition-centers", keywords: ["tuition", "coaching", "classes"] },
    { name: "Home Tutors", url: "/home-tutors", keywords: ["home tuition", "private tutor"] },
    { name: "Online Tutors", url: "/online-tutors", keywords: ["online tuition", "zoom", "digital tutor"] },
    { name: "Pediatric Doctors", url: "/pediatric-doctors", keywords: ["doctor", "hospital", "child health", "medical"] },
    { name: "Book Publishers", url: "/book-publishers", keywords: ["books", "publishing", "textbooks"] },
    { name: "Electronic Gadgets", url: "/electronic-gadgets", keywords: ["gadgets", "laptop", "mobile", "study tools"] },
    { name: "Scholarships", url: "/scholarships", keywords: ["money", "aid", "scholarship", "funds"] },
    { name: "Winners", url: "/winners", keywords: ["results", "leaders", "prize"] },
    { name: "Enquiry", url: "/enquiry", keywords: ["contact", "ask", "question", "help"] },
    { name: "About Us", url: "/about", keywords: ["who we are", "info", "background"] },
    { name: "Events", url: "/events", keywords: ["programs", "competitions", "celebration"] },
];

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) return;

        // Simple fuzzy match
        const match = SEARCH_INDEX.find(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.keywords.some(k => k.toLowerCase().includes(searchTerm))
        );

        if (match) {
            router.push(match.url);
            setQuery("");
        } else {
            toast.error("No results found for '" + query + "'");
        }
    };
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur-md shadow-sm py-1">
            <div className="max-w-[1700px] mx-auto flex h-14 items-center justify-between px-4 lg:px-6">
                <div className="flex-1 flex justify-start items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Open Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-4 bg-slate-100/80 px-4 lg:px-5 py-2.5 rounded-2xl border border-slate-200 focus-within:border-blue-600 focus-within:bg-white transition-all w-full max-w-[500px]"
                    >
                        <div className="text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-800"
                            placeholder="Search (e.g. Science, Schools, Doctors)..."
                        />
                    </form>
                </div>

                <nav className="hidden lg:flex items-center gap-8 pl-12">
                    <Link href="/" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Home</Link>
                    <Link href="/about" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">About Us</Link>
                    <Link href="/associates" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Associates</Link>
                    <Link href="/programs" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Programs</Link>
                    <Link href="/scholarships" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Scholarships</Link>
                    <Link href="/gifts" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Gifts</Link>
                    <Link href="/events" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Events</Link>
                    <Link href="/winners" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Winners</Link>
                    <Link href="/enquiry" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Enquiry</Link>
                </nav>
            </div>
        </header>
    );
}
