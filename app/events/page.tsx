import MainLayout from "@/app/components/MainLayout";
import Link from "next/link";

const EVENTS = [
    {
        title: "State Level Felicitation 2024",
        date: "Feb 25, 2024",
        status: "Upcoming",
        location: "Central Auditorium, City Center",
        description: "Grand ceremony to honor the top monthly performers and 365-day merit holders.",
        type: "Award Ceremony",
        image: "🏆"
    },
    {
        title: "Inter-School Tech Quiz",
        date: "Mar 10, 2024",
        status: "Registration Open",
        location: "Hybrid (Online + Partner Centers)",
        description: "A special gadget-focused mega quiz. First 500 winners get 50% discount vouchers.",
        type: "Competition",
        image: "📱"
    },
    {
        title: "Mental Agility Workshop",
        date: "Feb 15, 2024",
        status: "Ongoing",
        location: "Edu Quiz Digital Portal",
        description: "Expert talk on digital discipline and memory enhancement techniques.",
        type: "Webinar",
        image: "🧠"
    }
];

export default function EventsPage() {
    return (
        <MainLayout>
            <div className="bg-slate-50 min-h-screen">
                {/* Hero */}
                <section className="bg-white border-b border-slate-200 py-16 px-6">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl lg:text-5xl font-black text-[#002e5d] mb-6 uppercase tracking-tight italic">
                            Events & <span className="text-[#e11d48]">Programs</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-bold">
                            Stay updated with our upcoming felicitation ceremonies, special contests, and workshops.
                        </p>
                    </div>
                </section>

                {/* Events List */}
                <section className="py-16 px-6">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {EVENTS.map((event, idx) => (
                            <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center hover:shadow-xl transition-all">
                                <div className="w-24 h-24 rounded-[2rem] bg-blue-50 text-4xl flex items-center justify-center shrink-0">
                                    {event.image}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap gap-3 items-center">
                                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">{event.type}</span>
                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest">{event.status}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#002e5d] transition-colors uppercase leading-tight italic">
                                        {event.title}
                                    </h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        {event.description}
                                    </p>
                                    <div className="flex flex-wrap gap-6 mt-4">
                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                            <span>📅</span> {event.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                            <span>📍</span> {event.location}
                                        </div>
                                    </div>
                                </div>
                                <Link href="/enquiry" className="px-8 py-4 bg-[#002e5d] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-900 transition-colors whitespace-nowrap">
                                    Join Event
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
