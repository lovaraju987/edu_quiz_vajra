"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function StudentsForm() {
    const [prefix, setPrefix] = useState("EQ");
    const [schoolName, setSchoolName] = useState("Vajra International");
    const [formData, setFormData] = useState({
        name: "",
        idNo: "",
        area: "",
        age: "",
        class: "",
    });

    const [students, setStudents] = useState<any[]>([]);
    const [isProfileActive, setIsProfileActive] = useState(false);
    const [loading, setLoading] = useState(true);

    // Auto-calculate next ID logic
    const getNextId = (currentStudents: any[]) => {
        if (!currentStudents || currentStudents.length === 0) return "1001";

        const numericIds = currentStudents
            .map(s => {
                const parts = s.idNo.split('-');
                const num = parseInt(parts[parts.length - 1]);
                return isNaN(num) ? 0 : num;
            })
            .sort((a, b) => b - a);

        const maxId = numericIds[0] || 1000;
        return (maxId + 1).toString();
    };

    useEffect(() => {
        const fetchProfileAndStudents = async () => {
            const session = localStorage.getItem("faculty_session");
            const faculty = session ? JSON.parse(session) : null;

            if (faculty) {
                const targetId = faculty.id || faculty._id;
                try {
                    const pRes = await fetch(`/api/faculty/profile?facultyId=${targetId}`);

                    if (pRes.ok) {
                        const pData = await pRes.json();
                        const pActive = pData.isProfileActive || (pData.uniqueId && pData.schoolName);
                        setIsProfileActive(!!pActive);

                        if (pActive) {
                            const currentPrefix = pData.uniqueId || "EQ";
                            setPrefix(currentPrefix);
                            setSchoolName(pData.schoolName || "Vajra International");

                            const updatedSession = {
                                ...faculty,
                                id: targetId,
                                _id: targetId, // Ensure _id is also updated if present
                                isProfileActive: true,
                                schoolName: pData.schoolName,
                                uniqueId: pData.uniqueId
                            };
                            localStorage.setItem("faculty_session", JSON.stringify(updatedSession));

                            const sRes = await fetch(`/api/students`, {
                                headers: {
                                    'Authorization': `Bearer ${faculty.token}`
                                }
                            });
                            const sData = await sRes.json();
                            if (Array.isArray(sData)) {
                                setStudents(sData);
                                setFormData(prev => ({ ...prev, idNo: getNextId(sData) }));
                            }
                        } else {
                            // If profile is not active, but faculty session exists, update local state based on session
                            setIsProfileActive(!!faculty.isProfileActive);
                        }
                    } else {
                        setIsProfileActive(!!faculty.isProfileActive);
                    }
                } catch (error) {
                    console.error("Fetch error", error);
                    setIsProfileActive(!!faculty.isProfileActive);
                }
            } else {
                setIsProfileActive(false);
            }
            setLoading(false);
        };
        fetchProfileAndStudents();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const session = localStorage.getItem("faculty_session");
        const faculty = session ? JSON.parse(session) : null;

        const finalId = `${prefix}-${formData.idNo}`;

        const res = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${faculty?.token}`
            },
            body: JSON.stringify({
                ...formData,
                idNo: finalId, // Send the fully qualified ID
                school: schoolName,
                facultyId: faculty?.id || faculty?._id
            }),
        });

        const data = await res.json();

        if (res.ok) {
            const updatedStudents = [data.student, ...students];
            setStudents(updatedStudents);
            setFormData({
                name: "",
                idNo: getNextId(updatedStudents), // Auto-set next ID
                area: "",
                age: "",
                class: "",
            });
            toast.success(`Student Enrolled! ID: ${finalId}`);
        } else {
            toast.error(data.error || "Enrollment failed");
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading activation status...</div>;

    if (!isProfileActive) {
        return (
            <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-slate-200 text-center max-w-2xl mx-auto mt-12">
                <div className="text-6xl mb-6">🔒</div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">School Profile Not Activated</h2>
                <p className="text-slate-500 mb-8 font-medium">Please configure your School Name and Unique ID in the Profile section before you can enroll students.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.location.href = "/faculty/dashboard/profile"}
                        className="px-8 py-3 bg-[#002e5d] text-white font-black rounded-xl hover:bg-[#003d7a] transition-all shadow-lg active:scale-95 text-xs uppercase tracking-widest"
                    >
                        Go to Profile Setup
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
                    >
                        Refresh status
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span>📝</span> Enroll New Student
                </h2>
                <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Student Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Rahul Sharma"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center justify-between">
                            Student ID
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black uppercase">Smart Auto</span>
                        </label>
                        <div className="relative flex items-center">
                            <div className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-500 cursor-not-allowed">
                                {prefix}-{formData.idNo}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Area / Location</label>
                        <input
                            type="text"
                            required
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="City / District"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
                            <input
                                type="number"
                                required
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="15"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Class</label>
                            <select
                                required
                                value={formData.class}
                                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                            >
                                <option value="">Select Class</option>
                                <option>4th</option>
                                <option>5th</option>
                                <option>6th</option>
                                <option>7th</option>
                                <option>8th</option>
                                <option>9th</option>
                                <option>10th</option>
                            </select>
                        </div>
                    </div>
                    <div className="lg:col-span-3 flex justify-end">
                        <button type="submit" className="px-8 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-200 active:scale-[0.98]">
                            Register Student
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b">
                    <h2 className="text-xl font-bold text-slate-900">Enrolled Students</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage and track your enrolled students for the current session.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Name</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">School</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Class</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">ID</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((student, idx) => (
                                <tr key={student.idNo + idx} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="font-bold text-slate-800">{student.name}</div>
                                    </td>
                                    <td className="px-8 py-4 text-slate-600">{student.school}</td>
                                    <td className="px-8 py-4">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs">{student.class}</span>
                                    </td>
                                    <td className="px-8 py-4 font-mono text-sm text-blue-600 font-bold">{student.idNo}</td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button className="text-slate-400 hover:text-blue-700 transition-colors font-bold text-sm">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
