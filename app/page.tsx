"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Flyer Header Section - Compact & High-Fidelity */}
      <div className="max-w-[1440px] mx-auto bg-white border-b shadow-sm relative z-50">
        <header className="flex flex-col">
          {/* Main Identity Bar */}
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-5">
              {/* Star Logo - Refined Geometry */}
              <div className="relative w-24 h-24 drop-shadow-xl active:scale-95 transition-all">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <path id="circlePathTop" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                    <mask id="starMask">
                      <rect width="100" height="100" fill="black" />
                      <path
                        d="M50 22 L58 42 L80 42 L62 55 L70 78 L50 64 L30 78 L38 55 L20 42 L42 42 Z"
                        fill="white"
                      />
                    </mask>
                  </defs>
                  <circle cx="50" cy="50" r="48" className="fill-[#002e5d]" />

                  {/* Straight Star */}
                  <path
                    d="M50 22 L58 42 L80 42 L62 55 L70 78 L50 64 L30 78 L38 55 L20 42 L42 42 Z"
                    className="fill-[#e11d48] stroke-white stroke-[2]"
                  />

                  {/* Tilted Blue Band - Increased Height & Thickness - Restricted to Star */}
                  <rect
                    x="46" y="0" width="3.5" height="100"
                    className="fill-[#002e5d]"
                    mask="url(#starMask)"
                    transform="rotate(15 50 50)"
                  />

                  <text className="text-[9px] font-black fill-white uppercase tracking-[0.2em]">
                    <textPath xlinkHref="#circlePathTop" startOffset="25%" textAnchor="middle">
                      eduquiz.world
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* Text Branding & Integrated Live Info */}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-[#e11d48] tracking-tighter italic leading-none">Edu Quiz</span>
                  <span className="text-4xl font-black text-[#002e5d] tracking-tighter italic leading-none">world</span>
                </div>

                {/* Live Section - Prominent & Beside Text */}
                <div className="flex items-center gap-4 mt-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full w-fit">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">LIVE PROGRAM</span>
                  </div>
                  <div className="h-3 w-[1px] bg-slate-300"></div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">TODAY'S DATE:</span>
                    <span className="text-[10px] font-extrabold text-[#002e5d] leading-none">{today}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/quiz/login" className="h-14 px-8 flex items-center justify-center text-[12px] font-black text-white bg-[#002e5d] border-b-4 border-[#001d3d] rounded-2xl hover:bg-[#003d7a] transition-all shadow-lg uppercase tracking-wider">
                Quiz Login
              </Link>
              <Link href="/results" className="h-14 px-8 flex items-center justify-center text-[12px] font-black text-white bg-[#002e5d] border-b-4 border-[#001d3d] rounded-2xl hover:bg-[#003d7a] transition-all shadow-lg uppercase tracking-wider">
                Result
              </Link>
              <Link href="/faculty/login" className="h-14 px-8 flex items-center justify-center text-[12px] font-black text-white bg-[#002e5d] border-b-4 border-[#001d3d] rounded-2xl hover:bg-[#003d7a] transition-all shadow-lg uppercase tracking-wider">
                Faculty Login
              </Link>
            </div>
          </div>

          <div className="marquee-container py-2.5 border-t border-slate-100 shadow-sm bg-[#ff8c00]">
            <div className="marquee-content flex">
              <div className="marquee-item !text-[12px] font-black !tracking-[0.15em] !text-white drop-shadow-sm">🏆 Daily Participants: 40% to 50% Gift Vouchers on Gadgets + Gifts for first 1000 rankers</div>
              <div className="marquee-item !text-[12px] font-black !tracking-[0.15em] !text-white drop-shadow-sm">🎓 30 days regular participants: Month end gifts and felicitation at near by College</div>
              <div className="marquee-item !text-[12px] font-black !tracking-[0.15em] !text-white drop-shadow-sm">💎 365 days participants: Top 100 nos. 1 lakh Study Scholarship with Privilege Merit Cards</div>
              <div className="marquee-item !text-[12px] font-black !tracking-[0.15em] !text-white drop-shadow-sm">🏆 Daily Participants: 40% to 50% Gift Vouchers on Gadgets + Gifts for first 1000 rankers</div>
              <div className="marquee-item !text-[12px] font-black !tracking-[0.15em] !text-white drop-shadow-sm">🎓 30 days regular participants: Month end gifts and felicitation at near by College</div>
              <div className="marquee-item !text-[12px] font-black !tracking-[0.15em] !text-white drop-shadow-sm">💎 365 days participants: Top 100 nos. 1 lakh Study Scholarship with Privilege Merit Cards</div>
            </div>
          </div>
        </header>
      </div>

      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur-md shadow-sm py-1">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex-1 flex justify-start">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-4 bg-slate-100/80 px-5 py-2.5 rounded-2xl border border-slate-200 focus-within:border-blue-600 focus-within:bg-white transition-all w-full max-w-[500px]"
            >
              <div className="text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-800"
                placeholder="Search Subjects (Science, GK, Telugu)..."
              />
            </form>
          </div>

          <nav className="hidden xl:flex items-center gap-8 pl-12">
            <Link href="/about" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">About Us</Link>
            <Link href="/associates" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Associates</Link>
            <Link href="/programs" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Programs</Link>
            <Link href="/scholarships" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Scholarships</Link>
            <Link href="/events" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Events</Link>
            <Link href="/winners" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Winners</Link>
            <Link href="/enquiry" className="text-[11px] font-black text-slate-500 hover:text-blue-800 transition-colors uppercase tracking-[0.1em]">Enquiry</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative py-20 px-4 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
          <div className="container mx-auto max-w-5xl relative z-10">
            <div className="text-center">
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
      </main>

      <footer className="py-16 bg-white border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">© 2026 Edu Quiz Project. Promoting Academic Integrity and Growth.</p>
        </div>
      </footer>
    </div>
  );
}
