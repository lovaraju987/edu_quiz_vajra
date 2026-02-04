import MainLayout from "@/app/components/MainLayout";
import Link from "next/link";

const WINNERS = [
    {
        name: "Rahul Sharma",
        school: "Delhi Public School",
        prize: "₹1 Lakh Scholarship",
        level: "Level 3",
        days: "365/365 Days",
        image: "🎓"
    },
    {
        name: "Priya Patel",
        school: "KV High School",
        prize: "Gaming Laptop",
        level: "Level 2",
        days: "Regular Participant",
        image: "💻"
    },
    {
        name: "Anish Kumar",
        school: "St. Xavier Academy",
        prize: "Study Tablet",
        level: "Level 1",
        days: "Top Scorer (Jan)",
        image: "📱"
    },
    {
        name: "Sanya Gupta",
        school: "Greenwood Int. School",
        prize: "Gift Voucher",
        level: "Level 3",
        days: "Daily Top 10",
        image: "🎟️"
    }
];

export default function WinnersPage() {
    return (
        <MainLayout>
            <div className="bg-slate-50 min-h-screen">
                {/* Hero */}
                <section className="bg-[#002e5d] text-white py-16 px-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 text-[15rem] opacity-5 pointer-events-none">⭐</div>
                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <h1 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tight italic">
                            Hall of <span className="text-[#e11d48]">Fame</span>
                        </h1>
                        <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-widest">
                            Celebrating the dedication and brilliance of our top performers.
                        </p>
                    </div>
                </section>

                {/* Winners Grid */}
                <section className="py-16 px-6 max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 lg:grid-cols-2 gap-8">
                        {WINNERS.map((winner, idx) => (
                            <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all text-center relative pt-16">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-slate-50 border-8 border-slate-50 shadow-xl flex items-center justify-center text-5xl">
                                    {winner.image}
                                </div>
                                <div className="space-y-4">
                                    <div className="px-3 py-1 bg-rose-100 text-[#e11d48] rounded-full text-[10px] font-black uppercase tracking-widest inline-block">
                                        {winner.level}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 leading-tight uppercase font-black tracking-tighter">
                                        {winner.name}
                                    </h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider h-8">
                                        {winner.school}
                                    </p>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Won Prize</p>
                                        <p className="text-[#002e5d] font-black text-lg italic tracking-tight">{winner.prize}</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-green-600 uppercase tracking-widest">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        {winner.days}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Leaderboard Prompt */}
                <section className="px-6 pb-20">
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 border border-slate-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-black text-[#002e5d] uppercase tracking-tighter mb-2">Want to see yourself here?</h2>
                            <p className="text-slate-500 font-bold">Start your daily quiz streak today and win amazing prizes.</p>
                        </div>
                        <Link href="/quiz/login" className="px-10 py-5 bg-[#e11d48] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-rose-700 transition-all text-sm">
                            Write Today's Exam
                        </Link>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
