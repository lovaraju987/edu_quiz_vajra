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
    { name: "GK", icon: "🧠", color: "bg-blue-100 text-blue-700" },
    { name: "SCIENCE & TECH", icon: "🔬", color: "bg-green-100 text-green-700" },
    { name: "SPORTS", icon: "🏆", color: "bg-orange-100 text-orange-700" },
    { name: "HISTORY", icon: "📜", color: "bg-amber-100 text-amber-700" },
    { name: "HEALTH", icon: "🍎", color: "bg-red-100 text-red-700" },
    { name: "CURRENT AFFAIRS", icon: "🗞️", color: "bg-purple-100 text-purple-700" },
  ];

  const filteredCategories = categories; // No local search state, so all categories are shown

  return (
    <MainLayout>
      <section className="relative py-12 px-4 bg-white overflow-hidden">
        {/* Background Doodles */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 rotate-12 animate-float">✏️</div>
        <div className="absolute bottom-20 right-20 text-6xl opacity-20 -rotate-12 animate-bounce">🎨</div>
        <div className="absolute top-20 right-1/3 text-4xl opacity-10 animate-pulse">⭐</div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Main Content */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block px-4 py-2 mb-6 text-sm font-bold tracking-widest text-white uppercase bg-[#7209B7] rounded-full shadow-md transform -rotate-2">
                Mobile Phone De-action Program
              </span>

              <h1 className="mb-6 text-4xl lg:text-5xl font-black tracking-tight text-[#171717] sm:text-7xl drop-shadow-sm">
                Prove Your Talent & <br />
                <span className="text-[#4CC9F0] drop-shadow-md" style={{ WebkitTextStroke: '1px #000' }}>Win Exclusive Gifts</span>
              </h1>
              <p className="max-w-2xl mx-auto lg:mx-0 mb-10 text-xl font-medium leading-relaxed text-slate-700">
                A daily quiz-based engagement program designed to promote academic excellence, digital discipline, and moral development among students.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                <button
                  onClick={handleStartDailyQuiz}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-xl font-black text-[#5c3a00] transition-all duration-200 bg-[#FFD93D] border-b-[6px] border-[#b8860b] rounded-2xl hover:brightness-110 active:border-b-0 active:translate-y-[6px] hover:shadow-xl hover:-translate-y-1"
                >
                  <span className="mr-2">Start Daily Quiz</span>
                  <span className="group-hover:animate-bounce">🚀</span>
                </button>
                <button
                  onClick={handleStudentLogin}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-xl font-black text-white transition-all duration-200 bg-[#7209B7] border-b-[6px] border-[#4a0578] rounded-2xl hover:brightness-110 active:border-b-0 active:translate-y-[6px] hover:shadow-xl hover:-translate-y-1"
                >
                  <span className="mr-2">Student Login</span>
                  <span className="group-hover:rotate-12 transition-transform">🎓</span>
                </button>
              </div>
            </div>

            {/* Live Streaming Section with Banner Above */}
            <div className="flex-1 w-full flex flex-col items-center lg:items-end mt-10 lg:mt-0 gap-3">
              {/* Exam Status Banner - Compact Version */}
              <div className={`w-full max-w-lg p-2 rounded-lg border-2 border-b-3 flex items-center justify-between gap-2 transition-all duration-300 ${examStatus === 'Live'
                ? 'bg-green-50 border-green-500 text-green-700 shadow-[0_2px_0_0_rgba(22,163,74,1)]'
                : examStatus === 'Opening Soon'
                  ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-[0_2px_0_0_rgba(217,119,6,1)]'
                  : 'bg-red-50 border-red-500 text-red-700 shadow-[0_2px_0_0_rgba(220,38,38,1)]'
                }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${examStatus === 'Live' ? 'bg-green-500' : examStatus === 'Opening Soon' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>
                  <span className="text-[11px] font-black uppercase tracking-wide">
                    {examStatus === 'Live' ? 'Exam is LIVE' : examStatus === 'Opening Soon' ? 'Coming Soon' : 'Exam Closed'}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-bold opacity-60 uppercase">
                    {examStatus === 'Live' ? 'Ends in' : examStatus === 'Opening Soon' ? 'Starts in' : 'Next Exam'}
                  </span>
                  <span className="text-base font-black tabular-nums">{countdown}</span>
                </div>
              </div>

              {/* Live Streaming Component */}
              <div className="transform rotate-1 hover:rotate-0 transition-transform duration-300 w-full max-w-2xl">
                <LiveStreaming />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="mb-20 text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 animate-fade-up">Quiz Categories</h2>
            <p className="text-slate-600 text-lg animate-fade-up delay-100">Select your domain of expertise and compete with the best minds.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((cat, idx) => (
              <div
                key={cat.name}
                className={`group p-8 rounded-2xl relative overflow-hidden cursor-pointer animate-fade-up bg-white border-2 border-b-[6px] border-slate-200 transition-all duration-200 hover:-translate-y-2 hover:border-b-[8px] hover:border-blue-400 hover:shadow-xl`}
                style={{ animationDelay: `${idx * 100 + 200}ms` }}
              >
                <div className={`w-14 h-14 ${cat.color} bg-opacity-20 flex items-center justify-center rounded-2xl text-3xl mb-6 relative z-10 ring-2 ring-white group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{cat.name}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 border-b-2 border-slate-100 pb-6">Explore our curated questions in {cat.name.toLowerCase()}.</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Start Quiz</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 transition-all shadow-sm">
                    <span className="text-slate-400 font-black transform -rotate-45 group-hover:rotate-0 group-hover:text-white transition-all duration-300">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
