"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // If on login page, render without layout
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const menuItems = [
        { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
        { label: "Students", href: "/admin/students", icon: "mortar-board" }, // using emoji pending icon lib
        { label: "Faculty", href: "/admin/faculty", icon: "👨‍🏫" },
        { label: "Quizzes", href: "/admin/quizzes", icon: "📝" },
        { label: "Settings", href: "/admin/settings", icon: "⚙️" },
    ];

    return (
        <div className="min-h-screen flex bg-slate-100 font-sans text-slate-900">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-50">
                <div className="h-16 flex items-center justify-center border-b border-slate-800">
                    <h1 className="text-xl font-bold tracking-wider text-blue-400">ADMIN CONTROL</h1>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                <span className="text-xl">{item.icon.length > 2 ? '🔹' : item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button className="w-full py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors text-sm font-bold uppercase tracking-wider">
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen flex flex-col">
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
                    <h2 className="text-slate-500 font-medium">Welcome back, Admin</h2>
                    <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                        A
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
