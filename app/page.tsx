"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MainLayout from "./components/MainLayout";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [session, setSession] = useState<any>(null);
  const [today, setToday] = useState("");
  const router = useRouter();

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
  }, []);

  const handleStartDailyQuiz = () => {
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
      <section className="relative py-20 px-4 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Main Content */}
          <div className="flex-1 text-center">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-blue-700 uppercase bg-blue-100 rounded-full">
              Mobile Phone De-action Program
            </span>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              Prove Your Talent & <br />
              <span className="text-blue-700">Win Exclusive Gifts</span>
            </h1>
            <p className="max-w-2xl mx-auto mb-10 text-lg leading-relaxed text-slate-600">
              A daily quiz-based engagement program designed to promote academic excellence, digital discipline, and moral development among students.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleStartDailyQuiz}
                className="px-8 py-4 text-lg font-bold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-all hover:scale-105 shadow-lg"
              >
                Start Daily Quiz
              </button>
              <button
                onClick={handleStudentLogin}
                className="px-8 py-4 text-lg font-bold text-blue-700 border-2 border-blue-700 rounded-xl hover:bg-blue-50 transition-all"
              >
                Student Login
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Quiz Categories</h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">Choose your field of expertise and demonstrate your knowledge</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => (
              <div key={cat.name} className="group p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer">
                <div className={`w-14 h-14 ${cat.color} flex items-center justify-center rounded-2xl text-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{cat.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">Explore our curated questions in {cat.name.toLowerCase()}.</p>
                <span className="text-sm font-bold text-blue-700 group-hover:translate-x-1 inline-block transition-transform">Explore Now →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <div className="text-[200px] font-black rotate-12">REWARDS</div>
        </div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-extrabold mb-8 leading-tight">
                Privileges & Rewards to <br />
                <span className="text-yellow-400">Quiz Participants</span>
              </h2>
              <div className="space-y-6 text-blue-100">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-bold shadow-lg text-sm">1</div>
                  <p className="text-lg">Top 100 students receive educational gadgets as gifts.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-bold shadow-lg text-sm">2</div>
                  <p className="text-lg">Useful discounts of 40% to 50% for top 1000 rankers.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-bold shadow-lg text-sm">3</div>
                  <p className="text-lg">One lakh study scholarship for regular participants.</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-full bg-yellow-400 text-blue-900 mb-4 shadow-xl text-2xl">
                  <span>⏰</span>
                </div>
                <h3 className="text-2xl font-bold">Daily Quiz Live</h3>
                <p className="text-blue-200 mt-2 font-medium tracking-wide italic">Every day at 8:30 PM</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="font-medium text-blue-100">Questions</span>
                  <span className="font-black text-white">25</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="font-medium text-blue-100">Duration</span>
                  <span className="font-black text-white">15 Mins</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-medium text-blue-100">Participation</span>
                  <span className="font-black text-green-400 font-mono tracking-widest">OPEN NOW</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
