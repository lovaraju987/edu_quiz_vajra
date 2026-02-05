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
      <section className="relative bg-white overflow-hidden flex-1 flex flex-col justify-center min-h-0">
        {/* Background Doodles */}
        <div className="absolute top-10 left-10 text-[clamp(2rem,6vh,4rem)] opacity-20 rotate-12 animate-float">✏️</div>
        <div className="absolute bottom-20 right-20 text-[clamp(2rem,6vh,4rem)] opacity-20 -rotate-12 animate-bounce">🎨</div>
        <div className="absolute top-20 right-1/3 text-[clamp(1.5rem,4vh,3rem)] opacity-10 animate-pulse">⭐</div>

        <div className="container mx-auto max-w-[1750px] relative z-10 py-[clamp(0.5rem,2vh,2.5rem)] px-4 h-full flex flex-col justify-evenly overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-[clamp(1rem,4.5vh,3.5rem)] flex-1 min-h-0">
            {/* Main Content */}
            <div className="flex-1 text-center lg:text-left flex flex-col justify-center gap-[clamp(0.5rem,2.5vh,2rem)]">
              <div>
                <span className="inline-block px-4 py-1 mb-[clamp(0.25rem,1vh,0.75rem)] text-[clamp(9px,1.2vh,11px)] font-black tracking-widest text-white uppercase bg-[#7209B7] rounded-full shadow-md transform -rotate-1">
                  Responsible Mobile Usage Initiative
                </span>

                <h1 className="mb-[clamp(0.25rem,1vh,0.5rem)] text-[clamp(1.75rem,5.5vh,3.8rem)] font-black tracking-tight text-[#171717] drop-shadow-sm leading-[1.05]">
                  Participate in Daily Quiz, <br />
                  Prove Your Talent & <br />
                  <span className="text-[#4CC9F0] drop-shadow-md" style={{ WebkitTextStroke: '1.2px #000' }}>Win Exclusive Gifts & Rewards</span>
                </h1>
                <p className="max-w-xl mx-auto lg:mx-0 text-[clamp(11px,1.8vh,1.1rem)] font-medium leading-[1.4] text-slate-700">
                  A daily quiz program promoting academic excellence and digital discipline among students.
                </p>
              </div>

              {/* Static Rewards Cards - Adaptive size */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(0.5rem,1.5vh,1.5rem)] max-w-4xl mx-auto lg:mx-0">
                {/* Daily Rewards */}
                <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 rounded-2xl p-[clamp(0.5rem,2vh,1.25rem)] shadow-lg border-b-4 border-orange-600 transform transition hover:scale-105">
                  <div className="text-[clamp(1.2rem,3vh,2rem)] mb-1">🏆</div>
                  <h3 className="font-black text-white text-[clamp(8px,1.2vh,11px)] uppercase mb-0.5">Daily Participants</h3>
                  <p className="text-white text-[clamp(8px,1.1vh,10px)] font-semibold leading-tight">
                    Gift Vouchers & Gifts for first 1000 rankers
                  </p>
                </div>

                {/* Monthly Rewards */}
                <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl p-[clamp(0.5rem,2vh,1.25rem)] shadow-lg border-b-4 border-purple-700 transform transition hover:scale-105">
                  <div className="text-[clamp(1.2rem,3vh,2rem)] mb-1">🎓</div>
                  <h3 className="font-black text-white text-[clamp(8px,1.2vh,11px)] uppercase mb-0.5">30-Day Participants</h3>
                  <p className="text-white text-[clamp(8px,1.1vh,10px)] font-semibold leading-tight">
                    Month end gifts and felicitation ceremony
                  </p>
                </div>

                {/* Yearly Rewards */}
                <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 rounded-2xl p-[clamp(0.5rem,2vh,1.25rem)] shadow-lg border-b-4 border-red-700 transform transition hover:scale-105">
                  <div className="text-[clamp(1.2rem,3vh,2rem)] mb-1">💎</div>
                  <h3 className="font-black text-white text-[clamp(8px,1.2vh,11px)] uppercase mb-0.5">365-Day Participants</h3>
                  <p className="text-white text-[clamp(8px,1.1vh,10px)] font-semibold leading-tight">
                    ₹1 Lakh Study Scholarship & Merit Cards
                  </p>
                </div>
              </div>

              {/* Compact Category Cards */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-[clamp(0.4rem,1.2vh,1rem)] max-w-4xl mx-auto lg:mx-0 px-2 lg:px-0">
                {categories.map((cat) => (
                  <div
                    key={cat.name}
                    className="group bg-white border-2 border-b-4 border-slate-200 rounded-2xl p-1.5 transition-all hover:-translate-y-1 hover:border-blue-400 cursor-pointer shadow-sm flex flex-col items-center justify-center min-h-[clamp(50px,8vh,85px)]"
                  >
                    <div className="text-[clamp(1rem,2.5vh,2rem)] mb-0.5">{cat.icon}</div>
                    <h4 className="text-[clamp(7px,1.2vh,10px)] font-black text-slate-800 uppercase leading-tight line-clamp-2 text-center px-1">
                      {cat.name}
                    </h4>
                  </div>
                ))}
              </div>

              {/* Action Buttons Section */}
              <div className="flex flex-col items-center lg:items-start gap-[clamp(0.5rem,1.5vh,1rem)]">
                <div className="flex items-center gap-2 px-4 py-[clamp(0.2rem,0.8vh,0.5rem)] bg-slate-100/80 rounded-full border border-slate-200 shadow-sm ml-1">
                  <span className="text-[clamp(8px,1.1vh,10px)] font-bold text-slate-500 uppercase tracking-widest">Today's Date:</span>
                  <span className="text-[clamp(9px,1.2vh,11px)] font-black text-[#7209B7] tracking-wider">{today}</span>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-[clamp(0.5rem,1.5vw,1.5rem)]">
                  <button
                    onClick={handleStartDailyQuiz}
                    className="group relative inline-flex items-center justify-center px-[clamp(1rem,4vw,2.5rem)] py-[clamp(0.5rem,1.5vh,1rem)] text-[clamp(0.9rem,2vh,1.25rem)] font-black text-[#5c3a00] transition-all duration-200 bg-[#FFD93D] border-b-[6px] border-[#b8860b] rounded-2xl hover:brightness-110 active:border-b-0 active:translate-y-[6px] hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <span className="mr-2">Start Daily Quiz</span>
                    <span className="group-hover:animate-bounce">🚀</span>
                  </button>
                  <button
                    onClick={handleStudentLogin}
                    className="group relative inline-flex items-center justify-center px-[clamp(1rem,4vw,2.5rem)] py-[clamp(0.5rem,1.5vh,1rem)] text-[clamp(0.9rem,2vh,1.25rem)] font-black text-white transition-all duration-200 bg-[#7209B7] border-b-[6px] border-[#4a0578] rounded-2xl hover:brightness-110 active:border-b-0 active:translate-y-[6px] hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <span className="mr-2">Student Login</span>
                    <span className="group-hover:rotate-12 transition-transform">🎓</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Streaming Section with Banner Above */}
            <div className="flex-[0.8] xl:flex-1 w-full flex flex-col items-center lg:items-end justify-center gap-[clamp(0.5rem,2.5vh,2rem)] min-h-0">
              {/* Exam Status Banner - Match Screenshot Style */}
              <div className="w-full max-w-sm xl:max-w-md px-6 py-[clamp(0.4rem,1.2vh,0.75rem)] rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-4 w-full justify-center">
                  <div className="w-3 h-3 rounded-full shadow-sm animate-pulse bg-emerald-500"></div>
                  <span className="text-[clamp(10px,1.5vh,14px)] font-black uppercase tracking-[0.15em] text-center">
                    Results will be declared at 8 pm.
                  </span>
                </div>
              </div>

              {/* Live Streaming Component */}
              <div className="transition-transform duration-300 w-full max-w-md xl:max-w-lg shadow-2xl rounded-[clamp(1.5rem,4vh,3rem)] overflow-hidden shrink-0">
                <LiveStreaming />
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
