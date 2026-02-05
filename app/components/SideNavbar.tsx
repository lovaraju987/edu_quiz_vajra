import Link from "next/link";
import { MENU_ITEMS } from "../lib/constants";

export default function SideNavbar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    // Defines the menu items for the sidebar
    const menuItems = MENU_ITEMS;

    return (
        <>
            {/* Mobile Overlay - Only visible when menu is open on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/70 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* 
                Sidebar Container 
                - Desktop: Static part of the Grid (from MainLayout)
                - Mobile: Fixed overlay
            */}
            <aside className={`
                w-72 bg-[#0f172a] shadow-2xl border-r border-white/10
                flex flex-col overflow-hidden h-full shrink-0
                transition-all duration-500 ease-in-out
                fixed inset-y-0 left-0 z-[70] 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:z-30
            `}>
                {/* Header Section - FIXED TOP */}
                <div className="relative p-6 border-b border-white/10 bg-[#0f172a] shrink-0">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500"></div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-white font-black text-xl leading-tight tracking-tight uppercase italic flex flex-col">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">Educational</span>
                                <span className="text-[10px] tracking-[0.3em] font-medium text-slate-400 not-italic ml-0.5">DIRECTORY</span>
                            </h2>
                        </div>
                        <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Navigation Items - INTERNAL SCROLLING AREA */}
                {/* 
                    CRITICAL: 
                    1. flex-1 allows it to take all remaining vertical space.
                    2. overflow-y-scroll forces the scrollbar track for visibility.
                    3. min-h-0 prevents the container from expanding past its bounds.
                */}
                <nav className="flex-1 overflow-y-scroll overflow-x-hidden min-h-0 bg-[#0a192f] custom-sidebar-scroll" style={{ scrollbarGutter: 'stable' }}>
                    <style jsx global>{`
                        /* Global Scrollbar Styles for the Sidebar */
                        .custom-sidebar-scroll::-webkit-scrollbar {
                            width: 8px !important;
                        }
                        .custom-sidebar-scroll::-webkit-scrollbar-track {
                            background: rgba(0, 0, 0, 0.4) !important;
                        }
                        .custom-sidebar-scroll::-webkit-scrollbar-thumb {
                            background: #3b82f6 !important;
                            border-radius: 4px;
                            border: 2px solid #0a192f;
                        }
                        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
                            background: #60a5fa !important;
                        }
                        /* Firefox support */
                        .custom-sidebar-scroll {
                            scrollbar-width: thin;
                            scrollbar-color: #3b82f6 rgba(0,0,0,0.4);
                        }
                    `}</style>

                    <div className="py-5 px-3 space-y-2 pb-32">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className="group flex flex-col relative shrink-0 overflow-hidden rounded-xl transition-all duration-300 transform active:scale-95"
                                style={{ '--hover-color': item.color } as React.CSSProperties}
                            >
                                {/* Background Tint */}
                                <div
                                    className="absolute inset-0 transition-opacity duration-300 opacity-20"
                                    style={{ backgroundColor: item.color }}
                                />

                                <div className="relative z-10 flex items-center justify-between px-4 py-3.5 text-white/90">
                                    <span className="text-[11px] font-black tracking-widest uppercase group-hover:text-white group-hover:drop-shadow-[0_0_8px_var(--hover-color)] transition-all">
                                        {item.label}
                                    </span>
                                    <svg
                                        className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        style={{ color: item.color }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>

                                {/* Hover Border/Glow */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl border-2"
                                    style={{
                                        borderColor: item.color,
                                        boxShadow: `inset 0 0 15px ${item.color}30`
                                    }}
                                />
                            </Link>
                        ))}

                        {/* Bottom Marker */}
                        <div className="pt-12 pb-6 px-4 text-center">
                            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-auto mb-4"></div>
                            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">
                                Educational Directory End
                            </p>
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    );
}
