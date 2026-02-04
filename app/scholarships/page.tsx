import MainLayout from "@/app/components/MainLayout";
import Link from "next/link";

const SCHOLARSHIP_TIERS = [
    {
        title: "Mega Study Scholarship",
        amount: "₹1,00,000",
        eligibility: "Top 100 students (365-day regular participants)",
        benefits: ["Full Tuition Support", "Privilege Merit Card", "Personal Mentorship"],
        color: "from-amber-400 to-orange-600",
        icon: "💎"
    },
    {
        title: "Monthly Merit Award",
        amount: "₹10,000",
        eligibility: "Month-end top 10 rankers",
        benefits: ["Educational Kits", "Felicitation Ceremony", "Certificate of Excellence"],
        color: "from-blue-500 to-indigo-700",
        icon: "🎓"
    },
    {
        title: "Daily Excellence Voucher",
        amount: "40% - 50% Off",
        eligibility: "First 1000 rankers daily",
        benefits: ["Gadget Discounts", "Learning Resource Access", "Digital Badges"],
        color: "from-rose-500 to-red-700",
        icon: "🏆"
    }
];

export default function ScholarshipsPage() {
    return (
        <MainLayout>
            <div className="bg-slate-50 min-h-screen">
                {/* Hero */}
                <section className="bg-white border-b border-slate-200 py-16 px-6">
                    <div className="max-w-7xl mx-auto text-center">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-[#ff8c00]/10 border border-[#ff8c00]/20 text-[#ff8c00] text-xs font-black tracking-widest uppercase mb-4">
                            Academic Funding
                        </span>
                        <h1 className="text-4xl lg:text-5xl font-black text-[#002e5d] mb-6 italic">
                            Investment in <span className="text-[#e11d48]">Your Future</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-black uppercase tracking-tight">
                            Over ₹1 Crore in total scholarships to be awarded this academic year.
                        </p>
                    </div>
                </section>

                {/* Tiers Grid */}
                <section className="py-16 px-6">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                        {SCHOLARSHIP_TIERS.map((tier, idx) => (
                            <div key={idx} className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col h-full">
                                <div className={`bg-gradient-to-br ${tier.color} p-10 text-white text-center relative`}>
                                    <div className="absolute top-2 right-4 text-4xl opacity-20">{tier.icon}</div>
                                    <h3 className="text-xl font-black uppercase tracking-wider mb-2">{tier.title}</h3>
                                    <div className="text-4xl font-black tracking-tighter italic">{tier.amount}</div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="mb-6">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Eligibility</p>
                                        <p className="text-slate-800 font-bold">{tier.eligibility}</p>
                                    </div>
                                    <div className="mb-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Key Benefits</p>
                                        <ul className="space-y-3">
                                            {tier.benefits.map((benefit, i) => (
                                                <li key={i} className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                                                    <span className="text-green-500">✓</span>
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Link href="/quiz/login" className="mt-auto block text-center py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors">
                                        Participate Now
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Style Footer */}
                <section className="max-w-4xl mx-auto px-6 pb-20">
                    <div className="bg-[#002e5d] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black mb-6 uppercase tracking-widest italic border-b border-white/10 pb-4">How it works?</h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#e11d48] flex items-center justify-center font-black shrink-0">1</div>
                                    <p className="font-bold text-blue-100">Maintain a 100% attendance rate in the Daily Quiz app for one full academic year.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#e11d48] flex items-center justify-center font-black shrink-0">2</div>
                                    <p className="font-bold text-blue-100">Secure a spot in the Top 100 Global Leaderboard across all categories.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#e11d48] flex items-center justify-center font-black shrink-0">3</div>
                                    <p className="font-bold text-blue-100">Undergo a final verification round and felicitation ceremony at our partner centers.</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 p-10 text-9xl opacity-10 pointer-events-none tracking-tighter">RS</div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
