export default function Home() {
  const sidebarItems = [
    "Private schools ( Play )",
    "Private schools ( Day care )",
    "Private schools ( Kinder Garden )",
    "Private schools ( Primary )",
    "Private schools ( Secondary )",
    "Tuition Centers",
    "Home Tuitions ( tutors )",
    "Online Tutors",
    "Child Psychologist",
    "Pediatric Doctors & Hospitals",
    "Book Publishers",
    "Book Stalls",
    "Electronic gadgets",
    "Teachers Training & Consultancy",
  ];

  const categories = [
    { name: "SPORTS & GAMES", icon: "⚽" },
    { name: "KIDS COMPUTER", icon: "💻" },
    { name: "TELUGU LANGUAGE", icon: "🇮🇳" },
    { name: "ENGLISH LANGUAGE", icon: "🇬🇧" },
    { name: "NEW INVENTIONS", icon: "💡" },
    { name: "HINDI LANGUAGE", icon: "🇮🇳" },
    { name: "MATHEMATICS SUBJECT", icon: "➕" },
    { name: "GK current affairs", icon: "🌍" },
    { name: "BIOLOGY", icon: "🧬" },
    { name: "CHEMISTRY", icon: "🧪" },
    { name: "SCIENCE & TECHNOLOGY", icon: "🚀" },
    { name: "ROBOTICS", icon: "🤖" },
    { name: "COMPUTER SCIENCE", icon: "🖥️" },
    { name: "HEALTH & EXERCISE", icon: "🏃" },
  ];

  const navLinks = [
    "ABOUT US",
    "ASSOCIATES",
    "PROGRAMS",
    "SCHOLARSHIPS",
    "EVENTS",
    "QUIZ WINNERS",
    "ENQUIRY",
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-[1400px] mx-auto bg-white shadow-2xl overflow-hidden min-h-screen flex flex-col">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row">
          {/* Logo and Search Area */}
          <div className="p-4 flex-1 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                <div className="absolute inset-0 bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-white text-4xl sm:text-5xl drop-shadow-lg">⭐</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[10px] font-black text-white text-center leading-[0.8] tracking-tighter uppercase whitespace-nowrap rotate-[-15deg]">
                    eduquiz.world
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tighter italic">Edu Quiz world</span>
                <span className="text-[10px] font-bold text-slate-400 -mt-1 tracking-widest uppercase">Global Excellence</span>
              </div>
            </div>

            {/* Mobile Header / Search Placeholder */}
            <div className="w-full sm:w-auto flex items-center gap-2 bg-slate-100 rounded-lg p-2">
              <span className="text-slate-400 px-2 font-bold uppercase text-xs tracking-widest">SEARCH</span>
              <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-blue-900">🔍</div>
            </div>
          </div>

          {/* Orange Rewards Box */}
          <div className="w-full md:w-[450px] bg-[#ff8c00] p-6 text-white relative">
            <h2 className="text-lg font-black uppercase tracking-tight mb-4 border-b border-white/30 pb-2">
              Privileges and Rewards to <br /> Quiz Participants
            </h2>
            <div className="space-y-4 text-xs font-bold leading-relaxed">
              <div className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-white text-[#ff8c00] rounded-full flex items-center justify-center text-[10px]">A</span>
                <p>Daily Participants: 40% to 50% Gift Vouchers on Gadgets + Gifts for first 1000 rankers.</p>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-white text-[#ff8c00] rounded-full flex items-center justify-center text-[10px]">B</span>
                <p>30 days regular participants: Month end gifts and felicitation at near by College.</p>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-white text-[#ff8c00] rounded-full flex items-center justify-center text-[10px]">C</span>
                <p>365 days participants: Top 100 nos. 1 lakh Study Scholarship with Privilege Merit Cards.</p>
              </div>
            </div>
          </div>
        </header>

        {/* Horizontal Nav */}
        <nav className="nav-bar-blue">
          {navLinks.map((link) => (
            <a key={link} href="#" className="hover:text-yellow-400 transition-colors">{link}</a>
          ))}
        </nav>

        {/* Main Content Body */}
        <div className="flex flex-1 flex-col md:flex-row">
          {/* Left Sidebar */}
          <aside className="w-full md:w-64 flex flex-col border-r border-slate-100 bg-[#5bb8e4]">
            {sidebarItems.map((item) => (
              <a key={item} href="#" className="sidebar-item-blue group">
                <span>{item}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
              </a>
            ))}
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 p-8 bg-slate-50 relative">
            <div className="mb-12 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex-1 w-full sm:w-auto text-center relative overflow-hidden group">
                <div className="absolute top-2 right-2 p-1 bg-yellow-400 text-[8px] font-black rounded uppercase">Edu NEWS</div>
                <div className="text-2xl mb-2 font-bold text-blue-900 leading-tight">LIVE STREAMING</div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">National Integrity and Moralism</p>
                <div className="mt-4 flex justify-center">
                  <div className="w-16 h-2 bg-blue-100 rounded-full group-hover:w-20 transition-all duration-500"></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 w-full sm:w-72">
                <h2 className="text-sm font-black text-slate-900 border-b pb-2 mb-4 uppercase">Faculty Portals</h2>
                <a href="/faculty/login" className="flex items-center justify-between group">
                  <span className="text-blue-700 font-black text-xs">Faculty Login form to enter the Quiz Bits & key</span>
                  <span className="w-8 h-8 bg-blue-700 text-white rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform">▶</span>
                </a>
              </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <div key={cat.name} className="category-card group cursor-pointer active:scale-95 duration-75">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <div className="text-blue-900 leading-[1.1] uppercase tracking-tighter">
                    {cat.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Status Row */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Today's : DD:MM:YY</span>
                <span className="text-lg font-black text-blue-900 italic underline decoration-yellow-400">01 FEB 2026</span>
              </div>
              <div className="p-4 rounded-xl bg-blue-900 text-white flex flex-col items-center justify-center cursor-pointer hover:bg-blue-800 transition-colors">
                <span className="font-black text-sm uppercase">Quiz Login</span>
              </div>
              <div className="p-4 rounded-xl bg-[#002e5d] text-white flex flex-col items-center justify-center cursor-pointer hover:bg-blue-800 transition-colors">
                <span className="font-black text-sm uppercase tracking-widest text-yellow-400">Result ⭐⭐⭐</span>
              </div>
            </div>
          </main>
        </div>

        {/* Footer info line (from flyer) */}
        <div className="bg-slate-100 py-4 px-8 border-t">
          <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">
            Every month end an open debate will be conducted in your near by J-college for Event & Prize
          </p>
        </div>
      </div>
    </div>
  );
}
