"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MainLayout from "./components/MainLayout";

import LiveStreaming from "./components/LiveStreaming";

import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
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

    if (session?.user) {
      // @ts-ignore
      router.push(`/quiz/levels?level=${session.user.level}&id=${session.user.id}`);
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
      <section className="relative bg-white overflow-hidden flex-1 flex flex-col justify-center min-h-0 w-full h-full">
        {/* Background Doodles - Scaled down & optimized */}
        <div className="absolute top-10 left-10 text-[clamp(1.5rem,4vh,3rem)] opacity-20 rotate-12 animate-float">✏️</div>
        <div className="absolute bottom-10 right-10 text-[clamp(1.5rem,4vh,3rem)] opacity-20 -rotate-12 animate-bounce">🎨</div>
        <div className="absolute top-20 right-1/3 text-[clamp(1rem,3vh,2rem)] opacity-10 animate-pulse">⭐</div>

        <div className="w-full relative z-10 py-[0.8vh] px-4 h-full flex flex-col justify-between overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-[2vh] flex-1 min-h-0 w-full h-full">
            {/* Main Content */}
            <div className="flex-1 text-center flex flex-col justify-center gap-[1vh] h-full">
              <div className="flex flex-col justify-center items-center">
                <span className="self-center inline-block px-4 py-1.5 mb-[1vh] text-[clamp(11px,1.4vh,13px)] font-black tracking-widest text-white uppercase bg-[#7209B7] rounded-full shadow-md transform -rotate-1">
                  Responsible Mobile Usage Initiative
                </span>

                <h1 className="mb-[0.5vh] text-[clamp(1.5rem,4.5vh,3rem)] font-black tracking-tight text-[#171717] drop-shadow-sm leading-[1.1]">
                  Participate in Daily Quiz <br />
                  Prove Your Talent
                  <br />
                  <span className="text-[#4CC9F0] drop-shadow-md" style={{ WebkitTextStroke: '1px #000' }}>Win Exclusive <br />
                    Gifts, Vouchers & Rewards </span>
                </h1>
                <p className="max-w-xl mx-auto text-[clamp(10px,1.5vh,1rem)] font-medium leading-[1.3] text-slate-700">
                  A daily quiz program promoting academic excellence and digital discipline among students.
                </p>
              </div>

              {/* Static Rewards Cards - Balanced Sizing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[1vh] max-w-6xl mx-auto w-full">
                {/* Daily Rewards */}
                <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 rounded-xl p-[1.2vh] shadow-md border-b-4 border-orange-600 flex flex-col items-start text-left gap-[0.5vh]">
                  <h3 className="font-extrabold text-white text-[clamp(8.5px,1.1vh,11px)] uppercase leading-tight drop-shadow-sm border-b-2 border-red-900/40 pb-0.5 w-full text-center mb-1">
                    👉Daily Participants
                  </h3>
                  <div className="text-white text-[clamp(9.5px,1.2vh,12px)] font-bold leading-tight w-full space-y-1">
                    <div className="flex gap-1.5 items-start">
                      <span className="shrink-0">•</span>
                      <span>Daily Gifts For Top 100 Nos.</span>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <span className="shrink-0">•</span>
                      <span>Gift Vouchers For One Lakh Nos.</span>
                    </div>
                    <p className="text-[0.85em] opacity-80 italic pl-3">(Participants Encouragement Gifts)</p>
                  </div>
                </div>

                {/* Monthly Rewards */}
                <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl p-[1.2vh] shadow-md border-b-4 border-purple-700 flex flex-col items-start text-left gap-[0.5vh]">
                  <h3 className="font-extrabold text-white text-[clamp(8.5px,1.1vh,11px)] uppercase leading-tight drop-shadow-sm border-b-2 border-red-900/40 pb-0.5 w-full text-center mb-1">
                    👉Every Month End 30th Day Open Quiz At College
                  </h3>
                  <div className="text-white text-[clamp(10px,1.4vh,13px)] font-bold leading-tight w-full text-center">
                    Winner Certificate And Felicitation (Competition Among 10 School's Student).
                  </div>
                </div>

                {/* Yearly Rewards */}
                <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 rounded-xl p-[1.2vh] shadow-md border-b-4 border-red-700 flex flex-col items-start text-left gap-[0.5vh]">
                  <h3 className="font-extrabold text-white text-[clamp(8.5px,1.1vh,11px)] uppercase leading-tight drop-shadow-sm border-b-2 border-red-900/40 pb-0.5 w-full text-center mb-1">
                    👉365 Days Participants
                  </h3>
                  <div className="text-white text-[clamp(9.5px,1.2vh,12px)] font-bold leading-tight w-full space-y-1">
                    <div className="flex gap-1.5 items-start">
                      <span className="shrink-0">•</span>
                      <span>Top 100 Nos. 1 Lakh Study Scholarship*</span>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <span className="shrink-0">•</span>
                      <span>Privilege Merit Cards For Winners</span>
                    </div>
                    <p className="text-[0.7em] opacity-80 italic pl-3">* (Terms And Conditions Apply)</p>
                  </div>
                </div>
              </div>

              {/* Compact Category Cards */}
              <div className="grid grid-cols-5 gap-[1vh] max-w-4xl mx-auto lg:mx-0 w-full px-2 lg:px-0">
                {categories.map((cat) => (
                  <div
                    key={cat.name}
                    className="group bg-white border-2 border-b-4 border-slate-200 rounded-xl p-1 transition-all hover:-translate-y-0.5 hover:border-blue-400 cursor-pointer shadow-sm flex flex-col items-center justify-center min-h-[clamp(40px,6vh,70px)]"
                  >
                    <div className="text-[clamp(1rem,2vh,1.5rem)] mb-0.5">{cat.icon}</div>
                    <h4 className="text-[clamp(7px,1vh,9px)] font-black text-slate-800 uppercase leading-none text-center px-1">
                      {cat.name}
                    </h4>
                  </div>
                ))}
              </div>

              {/* Action Buttons Section */}
              <div className="flex flex-col items-center lg:items-start gap-[1.5vh]">
                <div className="flex items-center gap-2 px-3 py-[0.5vh] bg-slate-100/80 rounded-full border border-slate-200 shadow-sm ml-1">
                  <span className="text-[clamp(8px,1vh,10px)] font-bold text-slate-500 uppercase tracking-widest">Today's Date:</span>
                  <span className="text-[clamp(9px,1.1vh,11px)] font-black text-[#7209B7] tracking-wider">{today}</span>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-[1.5vh]">
                  <button
                    onClick={handleStartDailyQuiz}
                    className="group relative inline-flex items-center justify-center px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.4rem,1.2vh,0.8rem)] text-[clamp(0.8rem,1.8vh,1.1rem)] font-black text-[#5c3a00] transition-all bg-[#FFD93D] border-b-[4px] border-[#b8860b] rounded-xl active:translate-y-[4px]"
                  >
                    <span className="mr-2">Start Daily Quiz</span>
                    <span className="group-hover:animate-bounce">🚀</span>
                  </button>
                  <button
                    onClick={handleStudentLogin}
                    className="group relative inline-flex items-center justify-center px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.4rem,1.2vh,0.8rem)] text-[clamp(0.8rem,1.8vh,1.1rem)] font-black text-white transition-all bg-[#7209B7] border-b-[4px] border-[#4a0578] rounded-xl active:translate-y-[4px]"
                  >
                    <span className="mr-2">Student Login</span>
                    <span className="group-hover:rotate-12 transition-transform">🎓</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Streaming Section with Banner Above */}
            <div className="flex-[0.8] xl:flex-1 w-full flex flex-col items-center lg:items-end justify-center gap-[0.5vh] min-h-0 h-full">
              {/* Exam Status Banner */}
              <div className="w-full max-w-sm xl:max-w-md px-4 py-[0.5vh] rounded-full border border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm">
                <div className="flex items-center gap-2 w-full justify-center">
                  <div className="w-2 h-2 rounded-full animate-pulse bg-emerald-500"></div>
                  <span className="text-[clamp(8px,1.2vh,11px)] font-black uppercase tracking-widest text-center">
                    Results will be declared at 8:30 pm.
                  </span>
                </div>
              </div>

              {/* Live Streaming Component */}
              <div className="w-full max-w-sm xl:max-w-lg rounded-2xl overflow-hidden border border-slate-200/50">
                <LiveStreaming />
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
