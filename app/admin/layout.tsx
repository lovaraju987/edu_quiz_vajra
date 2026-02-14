"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // If on login page, render without layout
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const menuItems = [
        { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
        { label: "Students", href: "/admin/students", icon: "👨‍🎓" },
        { label: "Faculty", href: "/admin/faculty", icon: "👨‍🏫" },
        { label: "Educational Directory", href: "/admin/directory", icon: "🗂️" },
        { label: "Gifts", href: "/admin/gifts", icon: "🎁" },
        { label: "Quizzes", href: "/admin/quizzes", icon: "📝" },
        { label: "Settings", href: "/admin/settings", icon: "⚙️" },
    ];

    return (
        <div className="h-screen overflow-hidden flex bg-slate-100 font-sans text-slate-900">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Admin Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 transform 
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                <div className="h-16 flex items-center justify-center border-b border-slate-800 relative shrink-0">
                    <h1 className="text-xl font-bold tracking-wider text-blue-400">ADMIN CONTROL</h1>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 lg:hidden text-slate-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                    {menuItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 shrink-0">
                    <button
                        onClick={async () => {
                            try {
                                await fetch("/api/admin/logout", { method: "POST" });
                                window.location.href = "/";
                            } catch (e) {
                                window.location.href = "/";
                            }
                        }}
                        className="w-full py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors text-sm font-bold uppercase tracking-wider"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 flex flex-col h-full min-w-0 transition-all duration-300">
                <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden text-slate-500 hover:text-slate-900"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h2 className="text-slate-500 font-medium hidden sm:block">Welcome back, Admin</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                            A
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-thin scrollbar-thumb-slate-200">
                    {children}
                </div>
            </main>
        </div>
    );
}
