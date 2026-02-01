import Link from "next/link";

export default function SideNavbar() {
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
        <aside className="w-64 flex-shrink-0 hidden lg:block h-fit border-r border-[#001d3d]">
            <div className="bg-[#002e5d] shadow-xl p-0">
                <nav className="">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex w-full items-center justify-between px-4 py-3 text-white hover:bg-white/10 border-b border-white/5 transition-all font-bold text-sm group"
                        >
                            {item.label}
                            <span className="text-base opacity-50 group-hover:opacity-100 transition-opacity">&gt;</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
