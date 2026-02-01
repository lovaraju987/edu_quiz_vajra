"use client";

import Header from "./Header";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SideNavbar from "./SideNavbar";

interface MainLayoutProps {
    children: React.ReactNode;
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
    showSearch?: boolean;
}

export default function MainLayout({ children, searchQuery, setSearchQuery, showSearch = false }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <Header />
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} showSearch={showSearch} />

            {/* Main Content Area with Global Sidebar - FLUSH LAYOUT */}
            <div className="flex-1 max-w-7xl mx-auto flex w-full">
                <SideNavbar />
                <main className="flex-1 p-4 md:p-8">{children}</main>
            </div>

            <Footer />
        </div>
    );
}
