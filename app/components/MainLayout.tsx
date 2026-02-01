"use client";

import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SideNavbar from "./SideNavbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <Header />
            <Navbar />

            {/* Main Content Area with Global Sidebar - FLUSH LAYOUT */}
            <div className="flex-1 max-w-[1700px] mx-auto flex w-full">
                <SideNavbar />
                <main className="flex-1 p-4 md:p-8">{children}</main>
            </div>

            <Footer />
        </div>
    );
}
