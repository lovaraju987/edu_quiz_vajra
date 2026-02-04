import Link from "next/link";
import { MENU_ITEMS } from "../lib/constants";

export default function SideNavbar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    // Defines the menu items for the sidebar
    // This allows for easy maintenance and updates to navigation links
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
                bg-gradient-to-b from-slate-900 via-[#0a192f] to-[#002e5d] 
                shadow-2xl transform transition-transform duration-500 cubic-bezier(0.25, 1, 0.5, 1)
                border-r border-white/5
                lg:translate-x-0 lg:static lg:block lg:flex-shrink-0 lg:z-30 lg:h-auto lg:self-stretch
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header Section */}
                <div className="relative p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
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

                {/* Navigation Items */}
                <nav className="py-2 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-100px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {menuItems.map((item, index) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className="group flex flex-col relative overflow-hidden rounded-xl transition-all duration-300 border-b border-white/5 last:border-0"
                            style={{ '--hover-color': item.color } as React.CSSProperties}
                        >
                            <div className="relative z-10 flex items-center justify-between px-4 py-3 text-slate-400 transition-all duration-300 group-hover:text-white group-hover:translate-x-1">
                                <span className="text-sm font-bold tracking-wide group-hover:drop-shadow-[0_0_10px_var(--hover-color)]">{item.label}</span>
                                <span className="opacity-0 group-hover:opacity-100 transform translate-x-3 group-hover:translate-x-0 transition-all duration-300" style={{ color: item.color }}>
                                    →
                                </span>
                            </div>

                            {/* Hover Background & Border Effect - High Brightness */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl"
                                style={{
                                    backgroundColor: `${item.color}15`,
                                    border: `1.5px solid ${item.color}60`,
                                    boxShadow: `inset 0 0 20px ${item.color}30, 0 0 15px ${item.color}20`
                                }}
                            />

                            {/* Active Indicator Line - Glowing */}
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-0 group-hover:h-3/5 transition-all duration-300 rounded-r-full shadow-lg"
                                style={{
                                    backgroundColor: item.color,
                                    boxShadow: `0 0 10px ${item.color}`
                                }}
                            />
                        </Link>
                    ))}

                    <div className="mt-auto px-4 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 mx-2 mb-4">
                        <p className="text-blue-200 text-[10px] font-medium text-center leading-relaxed">
                            Discover top-rated institutions and secure your future.
                        </p>
                    </div>
                </nav>
            </aside>
        </>
    );
}
