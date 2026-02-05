"use client";

import { useState } from "react";

import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SideNavbar from "./SideNavbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    return (
        <div className="h-[100dvh] max-h-[100dvh] bg-slate-50 font-sans text-slate-900 flex flex-col overflow-hidden">
            <Header />
            <Navbar onMenuClick={() => setIsMobileNavOpen(true)} />

            {/* Main Content Area with Global Sidebar - FLUSH LAYOUT */}
            <div className="flex-1 max-w-[1700px] mx-auto flex w-full overflow-hidden min-h-0 relative">
                <SideNavbar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
                <main className="flex-1 overflow-y-auto flex flex-col min-h-0 relative">
                    {children}
                </main>
            </div>

            <Footer />
        </div>
    );
}
