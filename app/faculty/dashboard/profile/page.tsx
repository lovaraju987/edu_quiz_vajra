"use client";

import { useState, useEffect } from "react";

export default function FacultyProfile() {
    const [isProfileSet, setIsProfileSet] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        schoolName: "",
        schoolBoard: "CBSE",
        uniqueId: ""
    });
    const [faculty, setFaculty] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const session = localStorage.getItem("faculty_session");
            const sessionData = session ? JSON.parse(session) : null;
            if (sessionData) {
                setFaculty(sessionData);
                try {
                    const res = await fetch(`/api/faculty/profile?facultyId=${sessionData.id}`);
                    const data = await res.json();
                    if (res.ok && data.isProfileActive) {
                        setProfileData({
                            schoolName: data.schoolName,
                            schoolBoard: data.schoolBoard,
                            uniqueId: data.uniqueId
                        });
                        setIsProfileSet(true);
                    }
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (profileData.uniqueId.length < 2) {
            import('sonner').then(({ toast }) => toast.error("Unique ID must be at least 2 letters."));
            return;
        }

        try {
            const res = await fetch('/api/faculty/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    facultyId: faculty.id,
                    ...profileData
                })
            });

            const data = await res.json();
            if (res.ok) {
                // Update session with new faculty details
                const updatedSession = { ...faculty, ...data.faculty };
                localStorage.setItem("faculty_session", JSON.stringify(updatedSession));
                setIsProfileSet(true);
                import('sonner').then(({ toast }) => toast.success("School Profile Activated Successfully!"));
            } else {
                import('sonner').then(({ toast }) => toast.error(data.error || "Failed to save profile"));
            }
        } catch (error) {
            import('sonner').then(({ toast }) => toast.error("Connection error."));
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading profile...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Faculty Details Card */}
            <div className="bg-[#002e5d] text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <div className="text-9xl font-black rotate-12">PROF</div>
                </div>
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-blue-700 border-4 border-white/20 flex items-center justify-center text-4xl shadow-inner font-black uppercase">
                        {faculty?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || "FA"}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">{faculty?.name || "Faculty Member"}</h2>
                        <p className="text-blue-200 font-bold uppercase tracking-[0.2em] text-xs mt-1">
                            {isProfileSet ? `${profileData.schoolName} | ${profileData.schoolBoard}` : "Profile Pending Activation"}
                        </p>
                        <div className="flex gap-4 mt-4">
                            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">ID: {faculty?.id?.slice(-6) || "N/A"}</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isProfileSet ? 'bg-green-500/20 text-green-300 border-green-500/20' : 'bg-amber-500/20 text-amber-300 border-amber-500/20'}`}>
                                {isProfileSet ? 'Verified' : 'Pending Activation'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Data Display / Form */}
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-blue-50/50">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                        <span>🏫</span> School Configuration
                    </h3>
                    {isProfileSet && (
                        <button
                            onClick={() => setIsProfileSet(false)}
                            className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest underline underline-offset-4 transition-colors"
                        >
                            Edit Settings
                        </button>
                    )}
                </div>

                {isProfileSet ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-slate-50 rounded-3xl border border-slate-100 animate-[fadeIn_0.5s_ease-out]">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active School</p>
                            <p className="text-lg font-black text-slate-800">{profileData.schoolName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Board Affiliation</p>
                            <p className="text-lg font-black text-slate-800">{profileData.schoolBoard}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID Prefix</p>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-[#002e5d] text-white rounded-lg font-mono font-black text-lg shadow-md">{profileData.uniqueId}</span>
                                <span className="text-xs text-slate-400 font-bold italic">e.g. {profileData.uniqueId}-1001</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">School Name</label>
                            <input
                                type="text"
                                required
                                value={profileData.schoolName}
                                onChange={(e) => setProfileData({ ...profileData, schoolName: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-[#002e5d] outline-none transition-all font-bold text-slate-800"
                                placeholder="e.g. Vajra International School"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">School Board</label>
                            <select
                                value={profileData.schoolBoard}
                                onChange={(e) => setProfileData({ ...profileData, schoolBoard: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-[#002e5d] outline-none transition-all font-black text-slate-700"
                            >
                                <option>CBSE</option>
                                <option>ICSE</option>
                                <option>State Board</option>
                                <option>IB</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Unique ID (Min 2 letters)</label>
                            <input
                                type="text"
                                maxLength={5}
                                required
                                value={profileData.uniqueId}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    const usedIds = ['AB', 'XY', 'EQ']; // Mock used IDs
                                    if (val.length >= 2 && usedIds.includes(val)) {
                                        e.target.setCustomValidity('This ID is already in use. Please choose another.');
                                    } else {
                                        e.target.setCustomValidity('');
                                    }
                                    setProfileData({ ...profileData, uniqueId: val });
                                }}
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-[#002e5d] outline-none transition-all font-mono font-black uppercase text-slate-800"
                                placeholder="e.g. VG"
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-end pt-4">
                            <button
                                type="submit"
                                className="px-12 py-4 bg-[#002e5d] text-white font-black rounded-2xl hover:bg-[#003d7a] transition-all shadow-[0_10px_20px_rgba(0,46,93,0.2)] active:scale-95 uppercase tracking-widest text-xs"
                            >
                                Activate School Profile
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
