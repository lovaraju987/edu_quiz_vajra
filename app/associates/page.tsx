import MainLayout from "@/app/components/MainLayout";
import Link from "next/link";

const ASSOCIATES_LIST = [
    { label: "Private schools (Play)", href: "/private-schools-play", icon: "🏫" },
    { label: "Private schools (Day care)", href: "/private-schools-daycare", icon: "👶" },
    { label: "Private schools (Kinder Garden)", href: "/private-schools-kinder", icon: "🧸" },
    { label: "Private schools (Primary)", href: "/private-schools-primary", icon: "📚" },
    { label: "Private schools (Secondary)", href: "/private-schools-secondary", icon: "🎓" },
    { label: "Tuition Centers", href: "/tuition-centers", icon: "👨‍🏫" },
    { label: "Home Tutions (tutors)", href: "/home-tutors", icon: "🏠" },
    { label: "Online Tutors", href: "/online-tutors", icon: "💻" },
    { label: "Child Psychologist", href: "/child-psychologist", icon: "🧠" },
    { label: "Pediatric Doctors & Hospitals", href: "/pediatric-doctors", icon: "⚕️" },
    { label: "Book Publishers", href: "/book-publishers", icon: "📑" },
    { label: "Book Stalls", href: "/book-stalls", icon: "📖" },
    { label: "Electronic Gadgets (Stud)", href: "/electronic-gadgets", icon: "📱" },
    { label: "Sports & Fitness centers", href: "/sports-fitness", icon: "⚽" },
    { label: "Music & Dance schools", href: "/music-dance", icon: "🎸" }
];

export default function AssociatesPage() {
    return (
        <MainLayout>
            <div className="bg-slate-50 min-h-screen">
                {/* Hero */}
                <div className="bg-white border-b border-slate-200 py-16 px-6">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl lg:text-5xl font-black text-[#002e5d] mb-6 uppercase tracking-tight">
                            Our <span className="text-[#e11d48]">Associates</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-bold">
                            Connecting students with a vast network of educational institutions, professional mentors, and essential service providers.
                        </p>
                    </div>
                </div>

                {/* Grid */}
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ASSOCIATES_LIST.map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.href}
                                className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all flex flex-col items-start gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-50 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[#002e5d] transition-colors uppercase leading-tight">
                                        {item.label}
                                    </h3>
                                    <div className="mt-3 flex items-center text-[#e11d48] font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Details <span className="ml-2">→</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="max-w-7xl mx-auto px-6 pb-20">
                    <div className="bg-[#002e5d] rounded-[2.5rem] p-10 lg:p-16 text-center text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl lg:text-4xl font-black mb-4 italic">Become a Professional Associate?</h2>
                            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto font-medium">
                                If you are an educational institution or clinical professional, partner with Edu Quiz World to reach thousands of dedicated students.
                            </p>
                            <Link href="/enquiry" className="inline-block px-10 py-4 bg-[#e11d48] text-white font-black rounded-xl hover:bg-rose-700 transition-all shadow-lg uppercase tracking-widest">
                                Contact for Partnership
                            </Link>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 p-8 text-9xl opacity-10 pointer-events-none">⭐</div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
