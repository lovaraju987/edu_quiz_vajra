import Link from "next/link";
import { MENU_ITEMS } from "../lib/constants";

export default function SideNavbar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    // Defines the menu items for the sidebar
    const menuItems = MENU_ITEMS;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 
                bg-[#0f172a] shadow-2xl transform transition-transform duration-500
                border-r border-white/10
                lg:translate-x-0 lg:relative lg:block lg:flex-shrink-0 lg:z-30 lg:h-full lg:max-h-full
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                flex flex-col overflow-hidden
            `}>
                {/* Header Section - FIXED HEIGHT */}
                <div className="relative p-6 border-b border-white/10 bg-[#0f172a] shrink-0">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500"></div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-white font-extrabold text-xl leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                                Educational <br /> Directory
                            </h2>
                        </div>
                        <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Navigation Items - SCROLLABLE AREA */}
                {/* 
                    CRITICAL: We apply an explicit max-height calculation to force a scrollbar 
                    if the container's flexible height isn't correctly calculated by the browser.
                */}
                <nav
                    className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0a192f] custom-sidebar-scroll"
                    style={{
                        scrollbarGutter: 'stable'
                    }}
                >
                    <style jsx>{`
                        .custom-sidebar-scroll {
                            /* Standard scrollbar for Firefox */
                            scrollbar-width: auto;
                            scrollbar-color: #3b82f6 rgba(255, 255, 255, 0.1);
                        }
                        /* Custom Scrollbar Styling (Webkit) */
                        .custom-sidebar-scroll::-webkit-scrollbar {
                            width: 10px;
                            display: block !important;
                        }
                        .custom-sidebar-scroll::-webkit-scrollbar-track {
                            background: rgba(0, 0, 0, 0.3);
                        }
                        .custom-sidebar-scroll::-webkit-scrollbar-thumb {
                            background: #3b82f6; 
                            border-radius: 20px;
                            border: 2px solid #0a192f;
                        }
                        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
                            background: #60a5fa;
                        }
                    `}</style>

                    <div className="py-4 px-3 space-y-1 pb-24">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className="group flex flex-col relative shrink-0 overflow-hidden rounded-lg transition-all duration-300"
                                style={{ '--hover-color': item.color } as React.CSSProperties}
                            >
                                {/* Persistent Color Block with Border */}
                                <div
                                    className="absolute inset-0 transition-all duration-300"
                                    style={{
                                        backgroundColor: `${item.color}10`,
                                        border: `1.5px solid ${item.color}25`,
                                    }}
                                />

                                <div className="relative z-10 flex items-center justify-between px-4 py-3 text-white/90 transition-all duration-300 group-hover:translate-x-1">
                                    <span className="text-[12px] font-black tracking-tight uppercase group-hover:drop-shadow-[0_0_8px_var(--hover-color)] transition-all">
                                        {item.label}
                                    </span>
                                    <span
                                        className="opacity-0 group-hover:opacity-100 transform translate-x-3 group-hover:translate-x-0 transition-all duration-300 text-sm"
                                        style={{ color: item.color }}
                                    >
                                        →
                                    </span>
                                </div>

                                {/* Hover Highlight Overlay */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg"
                                    style={{
                                        backgroundColor: `${item.color}20`,
                                        border: `1.5px solid ${item.color}90`,
                                        boxShadow: `inset 0 0 15px ${item.color}30`
                                    }}
                                />

                                {/* Active Indicator Line - Glowing */}
                                <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-0 group-hover:h-3/4 transition-all duration-300 rounded-r-full"
                                    style={{
                                        backgroundColor: item.color,
                                        boxShadow: `0 0 10px ${item.color}`
                                    }}
                                />
                            </Link>
                        ))}

                        {/* Bottom Info Box */}
                        <div className="mt-8 px-4 py-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 mx-1 mb-10 shrink-0">
                            <p className="text-blue-200 text-[10px] font-bold text-center leading-relaxed">
                                Official Educational Partner Directory <br />
                                <span className="opacity-50 text-[9px] font-medium mt-1 block">End of Directory</span>
                            </p>
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    );
}
