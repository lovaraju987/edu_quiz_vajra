"use client";

import { useState } from "react";

import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SideNavbar from "./SideNavbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <Header />
            <Navbar onMenuClick={() => setIsMobileNavOpen(true)} />

            {/* Main Content Area with Global Sidebar - FLUSH LAYOUT */}
            <div className="flex-1 max-w-[1700px] mx-auto flex w-full overflow-hidden min-h-0">
                <SideNavbar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
                <main className="flex-1 overflow-y-auto lg:overflow-visible flex flex-col">{children}</main>
            </div>

            <Footer />
        </div>
    );
}
