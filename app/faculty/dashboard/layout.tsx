"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function FacultyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [faculty, setFaculty] = useState<any>(null);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem("faculty_session");
        if (!session) {
            router.push("/faculty/login");
        } else {
            const data = JSON.parse(session);
            setFaculty(data);
            if (data.role === 'admin') setIsAdmin(true);
        }
    }, [router]);

    // Close menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const navItems = [
        { name: "Profile", href: "/faculty/dashboard/profile", icon: "👤" },
        { name: "Overview", href: "/faculty/dashboard", icon: "📊" },
        // Only show Manage Teachers link if admin
        ...(isAdmin ? [{ name: "Manage Teachers", href: "/faculty/dashboard/teachers", icon: "👨‍🏫" }] : []),
        { name: "Students Form", href: "/faculty/dashboard/students", icon: "📝" },
        { name: "Quiz Results", href: "/faculty/dashboard/results", icon: "🌟" },
        { name: "Program Status", href: "/faculty/dashboard/status", icon: "⚡" },
    ];

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar (Responsive) */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-blue-900 text-white shadow-2xl z-[70] transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <Link href="/" className="flex items-center gap-2">
                                <span className="text-2xl font-bold tracking-tight text-white">Edu<span className="text-rose-400">Quiz</span></span>
                            </Link>
                            <p className="text-xs text-blue-300 font-bold mt-1 tracking-widest uppercase">School Portal</p>
                        </div>
                        <button
                            className="md:hidden p-2 text-blue-300 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-800">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? "bg-blue-800 text-white shadow-lg"
                                        : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-semibold">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-6 border-t border-blue-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center font-bold border-2 border-blue-600">
                                {faculty ? getInitials(faculty.name) : "??"}
                            </div>
                            <div>
                                <p className="text-sm font-bold truncate max-w-[120px]">{faculty?.name || "Professor"}</p>
                                <p className="text-[10px] text-blue-300 italic uppercase tracking-tighter truncate max-w-[120px]">
                                    {faculty?.schoolName || "Faculty"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem("faculty_session");
                                toast.success("Logged out successfully");
                                router.replace("/");
                            }}
                            className="block w-full text-center py-2 text-sm font-bold bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 flex flex-col h-full min-w-0">
                <header className="shrink-0 bg-white/80 backdrop-blur-md border-b px-4 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                        </button>
                        <h1 className="text-lg md:text-xl font-bold text-slate-800 truncate">
                            {navItems.find(item => item.href === pathname)?.name || "Dashboard"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <span className="hidden sm:inline-block px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">LIVE MODE</span>
                        <button className="p-2 text-slate-400 hover:text-blue-700 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        </button>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-200">
                    {children}
                </div>
            </main>
        </div>
    );
}
