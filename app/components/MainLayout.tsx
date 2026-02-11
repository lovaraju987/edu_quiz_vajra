"use client";

import { useState } from "react";
import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SideNavbar from "./SideNavbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    return (
        <div className="h-[100dvh] w-screen bg-slate-50 font-sans text-slate-900 grid grid-rows-[auto_auto_1fr_auto] overflow-hidden">
            {/* Top Navigation Stack */}
            <Header />
            <Navbar onMenuClick={() => setIsMobileNavOpen(true)} />

            {/* Middle Content Row - STRECHED TO REMAINING SPACE */}
            <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr] overflow-hidden min-h-0 w-full">
                {/* Sidebars and Navigation */}
                <SideNavbar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

                {/* Main Viewport - Locked for "Fit to Screen" */}
                <main className="flex flex-col bg-white/40 min-h-0 relative overflow-hidden">
                    <div className="flex-1 overflow-hidden min-h-0">
                        {children}
                    </div>
                </main>
            </div>

            {/* Bottom Status Bar */}
            <Footer />
        </div>
    );
}
