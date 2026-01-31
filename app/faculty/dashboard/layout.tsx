"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FacultyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { name: "Profile", href: "/faculty/dashboard/profile", icon: "👤" },
        { name: "Overview", href: "/faculty/dashboard", icon: "📊" },
        { name: "Students Form", href: "/faculty/dashboard/students", icon: "📝" },
        { name: "Quiz Results", href: "/faculty/dashboard/results", icon: "🌟" },
        { name: "Program Status", href: "/faculty/dashboard/status", icon: "⚡" },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-blue-900 text-white shadow-2xl z-50 hidden md:block">
                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold tracking-tight text-white">Edu<span className="text-rose-400">Quiz</span></span>
                        </Link>
                        <p className="text-xs text-blue-300 font-bold mt-1 tracking-widest uppercase">Faculty Portal</p>
                    </div>

                    <nav className="flex-1 mt-6 px-4 space-y-2">
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
                            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center font-bold border-2 border-blue-600">HM</div>
                            <div>
                                <p className="text-sm font-bold">Hemanth Malla</p>
                                <p className="text-xs text-blue-300 italic uppercase tracking-tighter">Senior Faculty</p>
                            </div>
                        </div>
                        <Link href="/" className="block w-full text-center py-2 text-sm font-bold bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors">
                            Sign Out
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b px-8 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-800">
                        {navItems.find(item => item.href === pathname)?.name || "Dashboard"}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">LIVE MODE</span>
                        <button className="p-2 text-slate-400 hover:text-blue-700 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        </button>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
