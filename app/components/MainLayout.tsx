"use client";

import { useState } from "react";
import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SideNavbar from "./SideNavbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    return (
        <div className="h-screen w-screen bg-slate-50 font-sans text-slate-900 grid grid-rows-[auto_auto_1fr_auto] overflow-hidden">
            {/* Top Navigation Stack */}
            <Header />
            <Navbar onMenuClick={() => setIsMobileNavOpen(true)} />

            {/* Middle Content Row */}
            <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr] w-full min-h-0 overflow-hidden">
                {/* Sidebars and Navigation */}
                <SideNavbar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

                {/* Main Scrollable Viewport */}
                <main className="flex flex-col bg-slate-50 h-full overflow-hidden relative">
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {children}
                    </div>
                </main>
            </div>

            {/* Bottom Status Bar */}
            <Footer />
        </div>
    );
}
