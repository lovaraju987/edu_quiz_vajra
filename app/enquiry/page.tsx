"use client";

import { useState } from "react";
import MainLayout from "@/app/components/MainLayout";
import { toast } from "sonner";

export default function EnquiryPage() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Enquiry sent successfully! We will contact you shortly.");
        (e.target as HTMLFormElement).reset();
        setLoading(false);
    };

    return (
        <MainLayout>
            <div className="bg-slate-50 min-h-screen py-10 lg:py-16">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-2">
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-black tracking-widest uppercase mb-4">
                            Get in Touch
                        </span>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
                            We are here to <span className="text-[#e11d48]">Help You</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Have questions about our programs, scholarships, or partnerships?
                            Fill out the form below and our team will get back to you within 24 hours.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Contact Information Form */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 lg:p-10 relative overflow-hidden">
                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full px-5 py-4 bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            pattern="^(\+91)?[6-9]\d{9}$"
                                            placeholder="+91 98765 43210"
                                            className="w-full px-5 py-4 bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full px-5 py-4 bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Subject</label>
                                    <select className="w-full px-5 py-4 bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 cursor-pointer">
                                        <option>General Enquiry</option>
                                        <option>School Partnership</option>
                                        <option>Technical Support</option>
                                        <option>Scholarship Info</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="How can we assist you today?"
                                        className="w-full px-5 py-4 bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-[#002e5d] text-white rounded-xl font-black text-lg uppercase tracking-widest hover:bg-[#003d7a] active:scale-[0.98] transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Message"
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Contact Info Cards */}
                        <div className="space-y-8 lg:mt-10">
                            {/* Card 1 */}
                            <div className="flex gap-6 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl shrink-0">
                                    📍
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Our Office</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        Hitech City, Madhapur,<br />
                                        Hyderabad, Telangana 500081
                                    </p>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="flex gap-6 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-3xl shrink-0">
                                    📞
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Call Us</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        Support: +91 98765 43210<br />
                                        Sales: +91 98765 43211
                                    </p>
                                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">Mon - Sat, 9am - 6pm</p>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="flex gap-6 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl shrink-0">
                                    ✉️
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Email Us</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        support@eduquiz.world<br />
                                        partners@eduquiz.world
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
