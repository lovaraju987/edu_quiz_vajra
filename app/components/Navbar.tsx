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

const NAV_ITEMS = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    {
        label: "Associates",
        href: "/associates",
        dropdown: [
            { label: "Private Schools", href: "/associates" },
            { label: "Tuition Centers", href: "/tuition-centers" },
            { label: "Home Tutors", href: "/home-tutors" },
            { label: "Online Tutors", href: "/online-tutors" },
            { label: "Medical Professionals", href: "/pediatric-doctors" },
            { label: "Book Resources", href: "/book-publishers" },
        ]
    },
    {
        label: "Programs",
        href: "/programs",
        dropdown: [
            { label: "Daily Quiz", href: "/quiz/login" },
            { label: "Level 1 (4th-6th)", href: "/quiz/login" },
            { label: "Level 2 (7th-8th)", href: "/quiz/login" },
            { label: "Level 3 (9th-10th)", href: "/quiz/login" },
            { label: "Scholarships", href: "/scholarships" },
        ]
    },
    { label: "Scholarships", href: "/scholarships" },
    { label: "Gifts", href: "/gifts" },
    { label: "Events", href: "/events" },
    { label: "Winners", href: "/winners" },
    { label: "Enquiry", href: "/enquiry" },
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
        <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur-md shadow-sm py-0">
            <div className="max-w-[1700px] mx-auto flex h-9 items-center justify-between px-4 lg:px-6">
                <div className="flex-1 flex justify-start items-center gap-2 sm:gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Open Menu"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2 sm:gap-4 bg-slate-100/80 px-2 sm:px-4 lg:px-5 py-1 rounded-xl sm:rounded-2xl border border-slate-200 focus-within:border-blue-600 focus-within:bg-white transition-all w-full max-w-[500px]"
                    >
                        <div className="text-blue-600 shrink-0">
                            <svg className="w-1 h-2 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs sm:text-sm w-full font-bold text-slate-800"
                            placeholder="Search (e.g. Science, Schools, Doctors)..."
                        />
                    </form>
                </div>

                <nav className="hidden lg:flex items-center gap-8 pl-12 h-full">
                    {NAV_ITEMS.map((item) => (
                        <div key={item.label} className="relative group h-full flex items-center">
                            <Link
                                href={item.href}
                                className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em] flex items-center gap-1 py-0.5"
                            >
                                {item.label}
                                {item.dropdown && (
                                    <svg className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-all transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </Link>

                            {item.dropdown && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden p-2">
                                        <div className="flex flex-col gap-1">
                                            {item.dropdown.map((sub, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={sub.href}
                                                    className="px-4 py-3 text-[10px] font-black text-slate-500 hover:text-[#002e5d] hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest flex items-center justify-between group/item"
                                                >
                                                    {sub.label}
                                                    <span className="opacity-0 group-hover/item:opacity-100 transition-all text-[#e11d48]">→</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
        </header>
    );
}
