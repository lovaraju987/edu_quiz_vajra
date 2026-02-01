import Link from "next/link";

export default function SideNavbar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    // Defines the menu items for the sidebar
    // This allows for easy maintenance and updates to navigation links
    const menuItems = [
        { href: "/private-schools-play", label: "Private schools (Play)" },
        { href: "/private-schools-daycare", label: "Private schools (Day care)" },
        { href: "/private-schools-kinder", label: "Private schools (Kinder Garden)" },
        { href: "/private-schools-primary", label: "Private schools (Primary)" },
        { href: "/private-schools-secondary", label: "Private schools (Secondary)" },
        { href: "/tuition-centers", label: "Tuition Centers" },
        { href: "/home-tutors", label: "Home Tutions (tutors)" },
        { href: "/online-tutors", label: "Online Tutors" },
        { href: "/child-psychologist", label: "Child Psychologist" },
        { href: "/pediatric-doctors", label: "Pediatric Doctors & Hospitals" },
        { href: "/book-publishers", label: "Book Publishers" },
        { href: "/book-stalls", label: "Book Stalls" },
        { href: "/electronic-gadgets", label: "Electronic Gadgets (Stud)" },
        { href: "/sports-fitness", label: "Sports & Fitness centers" },
        { href: "/music-dance", label: "Music & Dance schools" },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[#002e5d] shadow-2xl transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:shadow-xl lg:block lg:flex-shrink-0 lg:h-fit lg:z-30
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between p-4 lg:hidden border-b border-white/10">
                    <span className="text-white font-bold text-lg">Menu</span>
                    <button onClick={onClose} className="text-white hover:bg-white/10 p-1 rounded-md">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose} // Auto-close on mobile when clicked
                            className="flex w-full items-center justify-between px-4 py-3 text-white hover:bg-white/10 border-b border-white/5 transition-all font-bold text-sm group"
                        >
                            {item.label}
                            <span className="text-base opacity-50 group-hover:opacity-100 transition-opacity">&gt;</span>
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
}
