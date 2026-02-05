"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MainLayout from "./components/MainLayout";

import LiveStreaming from "./components/LiveStreaming";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [session, setSession] = useState<any>(null);
  const [today, setToday] = useState("");
  const [examStatus, setExamStatus] = useState("Closed");
  const [countdown, setCountdown] = useState("");
  const router = useRouter();

  const calculateStatus = () => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(8, 0, 0, 0);
    const end = new Date(now);
    end.setHours(20, 0, 0, 0);

    const target = new Date();
    if (now < start) {
      setExamStatus("Opening Soon");
      target.setHours(8, 0, 0, 0);
    } else if (now >= start && now <= end) {
      setExamStatus("Live");
      target.setHours(20, 0, 0, 0);
    } else {
      setExamStatus("Closed");
      target.setDate(target.getDate() + 1);
      target.setHours(8, 0, 0, 0);
    }

    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    setCountdown(`${hours}h ${mins}m`);
  };

  useEffect(() => {
    // Prevent Hydration Mismatch for Date
    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '-');
    setToday(dateStr);

    const savedSession = localStorage.getItem("currentStudent");
    if (savedSession) {
      setSession(JSON.parse(savedSession));
    }

    calculateStatus();
    const interval = setInterval(calculateStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleStartDailyQuiz = () => {
    if (examStatus !== "Live") {
      toast.error(`The quiz is only available between 8:00 AM and 8:00 PM. Please come back in ${countdown}!`, {
        duration: 5000,
        position: 'top-center',
      });
      return;
    }

    if (session) {
      router.push(`/quiz/levels?level=${session.level}&id=${session.id}`);
    } else {
      router.push("/quiz/login");
    }
  };

  const handleStudentLogin = () => {
    router.push("/quiz/login");
  };

  const categories = [
    { name: "GK & CURRENT AFFAIRS", icon: "🧠", color: "bg-blue-100 text-blue-700" },
    { name: "SCIENCE & TECH", icon: "🔬", color: "bg-green-100 text-green-700" },
    { name: "SPORTS", icon: "🏆", color: "bg-orange-100 text-orange-700" },
    { name: "CORE (BY CLASS)", icon: "📚", color: "bg-amber-100 text-amber-700" },
    { name: "HEALTH", icon: "🍎", color: "bg-red-100 text-red-700" },
  ];

  const filteredCategories = categories; // No local search state, so all categories are shown

  return (
    <MainLayout>
      <section className="relative py-2 px-4 bg-white overflow-hidden flex-1 flex flex-col justify-center min-h-0">
        {/* Background Doodles */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 rotate-12 animate-float">✏️</div>
        <div className="absolute bottom-20 right-20 text-6xl opacity-20 -rotate-12 animate-bounce">🎨</div>
        <div className="absolute top-20 right-1/3 text-4xl opacity-10 animate-pulse">⭐</div>

        <div className="container mx-auto max-w-7xl relative z-10 py-1">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Main Content */}
            <div className="flex-1 text-center lg:text-left flex flex-col">
              <div className="mb-2">
                <span className="inline-block px-3 py-1 mb-2 text-[10px] font-bold tracking-widest text-white uppercase bg-[#7209B7] rounded-full shadow-md transform -rotate-1">
                  Responsible Mobile Usage Initiative
                </span>

                <h1 className="mb-1 text-3xl lg:text-4xl font-black tracking-tight text-[#171717] sm:text-5xl drop-shadow-sm leading-tight">
                  Participate in Daily Quiz, <br />
                  Prove Your Talent & <br />
                  <span className="text-[#4CC9F0] drop-shadow-md" style={{ WebkitTextStroke: '1.2px #000' }}>Win Exclusive Gifts & Rewards</span>
                </h1>
                <p className="max-w-xl mx-auto lg:mx-0 mb-1 text-sm font-medium leading-relaxed text-slate-700">
                  A daily quiz-based engagement program designed to promote academic excellence and digital discipline among students.
                </p>
              </div>

              {/* Static Rewards Cards - Optimized size */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 max-w-4xl mx-auto lg:mx-0">
                {/* Daily Rewards */}
                <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 rounded-xl p-3 shadow-lg border-b-4 border-orange-600 transform transition hover:scale-105">
                  <div className="text-xl mb-1">🏆</div>
                  <h3 className="font-black text-white text-[9px] uppercase mb-0.5">Daily Participants</h3>
                  <p className="text-white text-[9px] font-semibold leading-tight">
                    Gift Vouchers & Gifts for first 1000 rankers
                  </p>
                </div>

                {/* Monthly Rewards */}
                <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl p-3 shadow-lg border-b-4 border-purple-700 transform transition hover:scale-105">
                  <div className="text-xl mb-1">🎓</div>
                  <h3 className="font-black text-white text-[9px] uppercase mb-0.5">30-Day Participants</h3>
                  <p className="text-white text-[9px] font-semibold leading-tight">
                    Month end gifts and felicitation ceremony
                  </p>
                </div>

                {/* Yearly Rewards */}
                <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 rounded-xl p-3 shadow-lg border-b-4 border-red-700 transform transition hover:scale-105">
                  <div className="text-xl mb-1">💎</div>
                  <h3 className="font-black text-white text-[9px] uppercase mb-0.5">365-Day Participants</h3>
                  <p className="text-white text-[9px] font-semibold leading-tight">
                    ₹1 Lakh Study Scholarship & Merit Cards
                  </p>
                </div>
              </div>

              {/* Compact Category Cards */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5 md:gap-2 mb-3 max-w-4xl mx-auto lg:mx-0 px-2 lg:px-0">
                {categories.map((cat) => (
                  <div
                    key={cat.name}
                    className="group bg-white border-2 border-b-4 border-slate-200 rounded-xl p-1.5 md:p-2 transition-all hover:-translate-y-1 hover:border-blue-400 cursor-pointer shadow-sm"
                  >
                    <div className="text-sm md:text-base mb-0.5">{cat.icon}</div>
                    <h4 className="text-[7.5px] md:text-[8.5px] font-black text-slate-800 uppercase leading-tight line-clamp-2 text-center">
                      {cat.name}
                    </h4>
                  </div>
                ))}
              </div>

              {/* Action Buttons Section */}
              <div className="flex flex-col items-center lg:items-start gap-1 mt-0.5">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100/80 rounded-full border border-slate-200 shadow-sm ml-2 mb-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Date Today:</span>
                  <span className="text-[9px] font-black text-[#7209B7] tracking-wider">{today}</span>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <button
                    onClick={handleStartDailyQuiz}
                    className="group relative inline-flex items-center justify-center px-6 py-2.5 text-base font-black text-[#5c3a00] transition-all duration-200 bg-[#FFD93D] border-b-[4px] border-[#b8860b] rounded-xl hover:brightness-110 active:border-b-0 active:translate-y-[4px] hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span className="mr-2">Start Daily Quiz</span>
                    <span className="group-hover:animate-bounce">🚀</span>
                  </button>
                  <button
                    onClick={handleStudentLogin}
                    className="group relative inline-flex items-center justify-center px-6 py-2.5 text-base font-black text-white transition-all duration-200 bg-[#7209B7] border-b-[4px] border-[#4a0578] rounded-xl hover:brightness-110 active:border-b-0 active:translate-y-[4px] hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span className="mr-2">Student Login</span>
                    <span className="group-hover:rotate-12 transition-transform">🎓</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Streaming Section with Banner Above */}
            <div className="flex-1 w-full flex flex-col items-center lg:items-end mt-1 lg:mt-0 gap-2">
              {/* Exam Status Banner - Match Screenshot Style */}
              <div className="w-full max-w-md px-5 py-1.5 rounded-full border border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3 w-full justify-center">
                  <div className="w-2 rounded-full shadow-sm animate-pulse bg-emerald-500"></div>
                  <span className="text-[12px] font-black uppercase tracking-widest text-center">
                    Results will be declared at 8 pm.
                  </span>
                </div>
              </div>

              {/* Live Streaming Component */}
              <div className="transition-transform duration-300 w-full max-w-lg">
                <LiveStreaming />
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
