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
                w-64 bg-[#0f172a] shadow-2xl border-r border-white/10
                flex flex-col overflow-hidden h-full shrink-0
                transition-all duration-500 ease-in-out
                fixed inset-y-0 left-0 z-[70] 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:z-30
            `}>
                {/* Header Section - COMPACT TOP */}
                <div className="relative py-2 px-[clamp(1rem,3vh,1.2rem)] border-b border-white/10 bg-[#0f172a] shrink-0">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500"></div>
                    <div className="flex items-center justify-center relative">
                        <div className="w-full flex justify-center">
                            <h2 className="text-white font-black text-[clamp(0.65rem,1.4vh,0.85rem)] leading-none tracking-tight uppercase italic flex items-center gap-1.5 whitespace-nowrap">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">Educational Wings</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300">DIRECTORY</span>
                            </h2>
                        </div>
                        <button onClick={onClose} className="lg:hidden absolute right-0 text-white/50 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Navigation Items - INTERNAL SCROLLING AREA */}
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

                    <div className="py-2 px-3 space-y-0 pb-0">
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

                                <div className="relative z-10 flex items-center gap-2 px-3 py-0.5 text-white/90">
                                    <div className="shrink-0 group-hover:drop-shadow-[0_0_8px_var(--hover-color)] transition-all" style={{ color: item.color }}>
                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    </div>
                                    <span className="flex-1 text-[clamp(9px,1.2vh,10px)] font-black tracking-widest uppercase group-hover:text-white group-hover:drop-shadow-[0_0_8px_var(--hover-color)] transition-all flex flex-col">
                                        {item.label.includes('(') ? (
                                            <>
                                                <span>{item.label.split('(')[0].trim()}</span>
                                                <span className="text-inherit opacity-70 mt-0.5">
                                                    ({item.label.split('(')[1]}
                                                </span>
                                            </>
                                        ) : (
                                            item.label
                                        )}
                                    </span>
                                    <svg className="w-3 h-3 text-white/30 group-hover:text-white transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
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

                        {/* Bottom Marker - Reduced Gap */}
                        <div className="pt-4 pb-4 px-4 text-center">
                            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-auto mb-4"></div>
                            <p className="text-slate-500 text-[clamp(8px,1vh,10px)] font-bold uppercase tracking-[0.2em] opacity-40">
                                Educational Directory End
                            </p>
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    );
}
