"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { validateName, validatePhone } from "@/lib/utils/validation";

export default function FacultyProfile() {
    const [isProfileSet, setIsProfileSet] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({
        schoolName: "",
        schoolBoard: "CBSE",
        uniqueId: "",
        designation: "",
        phone: "",
        address: ""
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
                            uniqueId: data.uniqueId,
                            designation: data.designation || "",
                            phone: data.phone || "",
                            address: data.address || ""
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

    const validateProfileForm = () => {
        if (!validateName(profileData.schoolName)) {
            toast.error("School Name must be at least 3 characters");
            return false;
        }
        if (!/^[A-Z]{2,5}$/.test(profileData.uniqueId.toUpperCase())) {
            toast.error("Unique ID must be 2-5 letters only (No digits)");
            return false;
        }
        if (!profileData.designation.trim()) {
            toast.error("Designation is required");
            return false;
        }
        if (!validatePhone(profileData.phone)) {
            toast.error("Invalid 10-digit phone number");
            return false;
        }
        if (profileData.address.trim().length < 10) {
            toast.error("Please provide a more complete address");
            return false;
        }
        return true;
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateProfileForm()) return;

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
                toast.success("School Profile Activated Successfully!");
            } else {
                toast.error(data.error || "Failed to save profile");
            }
        } catch (error) {
            toast.error("Connection error.");
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading profile...</div>;

    return (
        <div className="space-y-3 max-w-6xl mx-auto h-full flex flex-col justify-center">
            {/* Faculty Details Card */}
            <div className="bg-[#002e5d] text-white p-4 rounded-[20px] shadow-lg relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <div className="text-6xl font-black rotate-12">PROF</div>
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-700 border-2 border-white/20 flex items-center justify-center text-2xl shadow-inner font-black uppercase">
                        {faculty?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || "FA"}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight leading-none">{faculty?.name || "Faculty Member"}</h2>
                        <p className="text-blue-200 font-bold uppercase tracking-[0.1em] text-[10px] mt-0.5">
                            {isProfileSet ? `${profileData.schoolName} | ${profileData.schoolBoard}` : "Profile Pending Activation"}
                        </p>
                        <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">ID: {faculty?.id?.slice(-6) || "N/A"}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isProfileSet ? 'bg-green-500/20 text-green-300 border-green-500/20' : 'bg-amber-500/20 text-amber-300 border-amber-500/20'}`}>
                                {isProfileSet ? 'Verified' : 'Pending Activation'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Data Display / Form */}
            <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-xl shadow-blue-50/50 flex flex-col justify-center flex-1 min-h-0 overflow-y-auto">
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
                        <span>🏫</span> School Configuration
                    </h3>

                </div>

                {isProfileSet ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-[fadeIn_0.5s_ease-out]">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active School</p>
                            <p className="text-base font-black text-slate-800">{profileData.schoolName}</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Board Affiliation</p>
                            <p className="text-base font-black text-slate-800">{profileData.schoolBoard}</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Student ID Prefix</p>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-[#002e5d] text-white rounded font-mono font-black text-base shadow-sm">{profileData.uniqueId}</span>
                                <span className="text-[10px] text-slate-400 font-bold italic">e.g. {profileData.uniqueId}-1001</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">School Name</label>
                            <input
                                type="text"
                                required
                                value={profileData.schoolName}
                                onChange={(e) => setProfileData({ ...profileData, schoolName: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#002e5d] outline-none transition-all font-bold text-sm text-slate-800"
                                placeholder="e.g. Vajra International School"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">School Board</label>
                            <select
                                value={profileData.schoolBoard}
                                onChange={(e) => setProfileData({ ...profileData, schoolBoard: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#002e5d] outline-none transition-all font-black text-sm text-slate-700"
                            >
                                <option>CBSE</option>
                                <option>ICSE</option>
                                <option>State Board</option>
                                <option>IB</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Unique ID (Min 2 letters)</label>
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
                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#002e5d] outline-none transition-all font-mono font-black uppercase text-sm text-slate-800"
                                placeholder="e.g. VG"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Designation</label>
                            <input
                                type="text"
                                required
                                value={profileData.designation}
                                onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-bold text-sm text-slate-800"
                                placeholder="e.g. Principal"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                            <input
                                type="tel"
                                required
                                maxLength={10}
                                value={profileData.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setProfileData({ ...profileData, phone: val });
                                }}
                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-bold text-sm text-slate-800"
                                placeholder="e.g. 9876543210"
                            />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">School Address</label>
                            <input
                                type="text"
                                required
                                value={profileData.address}
                                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-bold text-sm text-slate-800"
                                placeholder="e.g. 123 Education Lane, Hyderabad"
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-end pt-2">
                            <button
                                type="submit"
                                className="px-8 py-3 bg-[#002e5d] text-white font-black rounded-xl hover:bg-[#003d7a] transition-all shadow-[0_5px_10px_rgba(0,46,93,0.2)] active:scale-95 uppercase tracking-widest text-[10px]"
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
