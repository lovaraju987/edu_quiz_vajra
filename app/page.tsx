"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-800 underline decoration-rose-500 decoration-3 underline-offset-4">Edu<span className="text-rose-600">Quiz</span></span>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-sm"
            >
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">SEARCH</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-28 font-medium text-slate-700"
                placeholder="Find a topic..."
              />
              <button type="submit" className="text-slate-400 hover:text-blue-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
            <a href="/about" className="text-xs font-bold text-slate-600 hover:text-blue-800 transition-colors">ABOUT US</a>
            <a href="/associates" className="text-xs font-bold text-slate-600 hover:text-blue-800 transition-colors">ASSOCIATES</a>
            <a href="/programs" className="text-xs font-bold text-slate-600 hover:text-blue-800 transition-colors">PROGRAMS</a>
            <a href="/scholarships" className="text-xs font-bold text-slate-600 hover:text-blue-800 transition-colors">SCHOLARSHIPS</a>
            <a href="/events" className="text-xs font-bold text-slate-600 hover:text-blue-800 transition-colors">EVENTS</a>
            <a href="/winners" className="text-xs font-bold text-slate-600 hover:text-blue-800 transition-colors">QUIZ WINNERS</a>
            <a href="/enquiry" className="text-xs font-bold text-slate-600 hover:text-blue-800 transition-colors">ENQUIRY</a>
            <a href="/faculty/login" className="ml-4 px-5 py-2.5 text-xs font-black text-white bg-blue-700 rounded-full hover:bg-blue-800 transition-all shadow-md hover:shadow-blue-200 active:scale-95 uppercase tracking-tight">Faculty Login</a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
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
                <button className="px-8 py-4 text-lg font-bold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-all hover:scale-105 shadow-lg">
                  Start Daily Quiz
                </button>
                <button className="px-8 py-4 text-lg font-bold text-blue-700 border-2 border-blue-700 rounded-xl hover:bg-blue-50 transition-all">
                  Student Login
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Quiz Categories</h2>
                <p className="text-slate-500 mt-2">
                  {searchQuery ? `Showing results for "${searchQuery}"` : "Choose your field of expertise and demonstrate your knowledge"}
                </p>
              </div>
              <a href="#" className="text-blue-700 font-semibold hover:underline">View All Topics →</a>
            </div>

            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((cat) => (
                  <div key={cat.name} className="group p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer">
                    <div className={`w-14 h-14 ${cat.color} flex items-center justify-center rounded-2xl text-2xl mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                      {cat.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{cat.name}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      Test your expertise in {cat.name.toLowerCase()} with our daily challenge and earn points.
                    </p>
                    <span className="text-sm font-bold text-blue-700 group-hover:translate-x-1 inline-block transition-transform">
                      Explore Now →
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No categories found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </section>

        {/* Benefits Section */}
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
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-bold shadow-lg">1</div>
                    <p className="text-lg">Top 100 students receive educational gadgets as gifts.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-bold shadow-lg">2</div>
                    <p className="text-lg">Useful discounts of 40% to 50% for top 1000 rankers.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-bold shadow-lg">3</div>
                    <p className="text-lg">One lakh study scholarship for regular participants.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl border border-white/20 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-block p-4 rounded-full bg-yellow-400 text-blue-900 mb-4 shadow-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className="text-2xl font-bold">Daily Quiz Live</h3>
                  <p className="text-blue-200 mt-2 font-medium tracking-wide">Every day at 8:30 PM</p>
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
                    <span className="font-black text-green-400">OPEN</span>
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
