import MainLayout from "@/app/components/MainLayout";
import Link from "next/link";

export default function AboutPage() {
    return (
        <MainLayout>
            <div className="bg-white">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-[#002e5d] text-white py-16 lg:py-24">
                    <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-[#e11d48]/20 border border-[#e11d48]/30 backdrop-blur-sm mb-6">
                            <span className="text-sm font-black tracking-widest uppercase text-white">Empowering Students</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black mb-8 tracking-tight italic">
                            Edu Quiz <span className="text-[#e11d48]">World</span>
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-bold">
                            Turning screen time into productive study time for students from 4th to 10th Class.
                        </p>
                    </div>
                </section>

                {/* About Content */}
                <section className="py-20 px-6">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl font-black text-[#002e5d] leading-tight">
                                What is <span className="text-[#e11d48]">Vajra</span> Edu Quiz?
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                Edu Quiz World (Vajra) is a revolutionary digital platform designed to bridge the gap between academic curriculum and digital engagement. We believe that learning should be as exciting as gaming, and that consistency deserves real rewards.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-[#002e5d]">
                                    <h3 className="text-lg font-black text-slate-900 mb-2">Our Mission</h3>
                                    <p className="text-slate-500 text-sm font-bold">To promote academic excellence and digital discipline among students worldwide through gamified learning.</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-[#e11d48]">
                                    <h3 className="text-lg font-black text-slate-900 mb-2">Our Vision</h3>
                                    <p className="text-slate-500 text-sm font-bold">A world where students are motivated to reach their full potential, supported by rewards and professional mentorship.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#002e5d] p-10 rounded-[2.5rem] text-white shadow-2xl relative">
                            <div className="absolute top-4 right-4 text-6xl opacity-20">⭐</div>
                            <h3 className="text-2xl font-black mb-6 border-b border-white/10 pb-4">Quiz Levels</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <span className="w-8 h-8 rounded-full bg-[#e11d48] flex items-center justify-center shrink-0 font-black">1</span>
                                    <div>
                                        <p className="font-black text-xl">Level 1</p>
                                        <p className="text-blue-200 font-bold uppercase tracking-widest text-xs">For Classes 4th to 6th</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-8 h-8 rounded-full bg-[#e11d48] flex items-center justify-center shrink-0 font-black">2</span>
                                    <div>
                                        <p className="font-black text-xl">Level 2</p>
                                        <p className="text-blue-200 font-bold uppercase tracking-widest text-xs">For Classes 7th to 8th</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-8 h-8 rounded-full bg-[#e11d48] flex items-center justify-center shrink-0 font-black">3</span>
                                    <div>
                                        <p className="font-black text-xl">Level 3</p>
                                        <p className="text-blue-200 font-bold uppercase tracking-widest text-xs">For Classes 9th to 10th</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Rewards Section */}
                <section className="bg-slate-50 py-20 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto relative">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-black text-slate-900 mb-4 italic">Exclusive <span className="text-[#ff8c00]">Rewards</span></h2>
                            <p className="text-slate-500 font-bold">We reward your dedication to learning with amazing prizes.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-3xl shadow-lg hover:-translate-y-2 transition-all border-b-8 border-[#e11d48]">
                                <div className="text-4xl mb-6">🏆</div>
                                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase">Daily Winners</h3>
                                <p className="text-slate-500 font-bold leading-relaxed">40% to 50% Gift Vouchers on Gadgets + Gifts for the first 1000 rankers daily.</p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-lg hover:-translate-y-2 transition-all border-b-8 border-[#002e5d]">
                                <div className="text-4xl mb-6">🎓</div>
                                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase">Monthly Honors</h3>
                                <p className="text-slate-500 font-bold leading-relaxed">30 days regular participants get month-end gifts and felicitation at nearby colleges.</p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-lg hover:-translate-y-2 transition-all border-b-8 border-[#ff8c00]">
                                <div className="text-4xl mb-6">💎</div>
                                <h3 className="text-xl font-black text-slate-900 mb-3 uppercase">Yearly Mega Prize</h3>
                                <p className="text-slate-500 font-bold leading-relaxed">Top 100 365-day participants receive ₹1 Lakh Study Scholarship and Privilege Merit Cards.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-24 px-6 text-center">
                    <div className="max-w-4xl mx-auto border-2 border-dashed border-slate-200 rounded-[3rem] p-12">
                        <h2 className="text-3xl font-black text-[#002e5d] mb-6">Ready to participate?</h2>
                        <p className="text-slate-500 font-bold mb-10 max-w-2xl mx-auto">Join thousands of students and start your journey towards academic excellence today. Every question you answer brings you closer to your goals.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/quiz/login" className="px-10 py-4 bg-[#e11d48] text-white font-black rounded-2xl hover:bg-rose-700 transition-all shadow-xl uppercase tracking-widest text-sm">
                                Join Now
                            </Link>
                            <Link href="/enquiry" className="px-10 py-4 bg-[#002e5d] text-white font-black rounded-2xl hover:bg-blue-900 transition-all shadow-xl uppercase tracking-widest text-sm">
                                Enquiry
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
