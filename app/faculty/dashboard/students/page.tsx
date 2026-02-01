"use client";

import { useState, useEffect } from "react";

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

    useEffect(() => {
        const savedProfile = localStorage.getItem("schoolProfile");
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            setPrefix(profile.uniqueId);
            setSchoolName(profile.schoolName);
        }

        const fetchStudents = async () => {
            const session = localStorage.getItem("faculty_session");
            const faculty = session ? JSON.parse(session) : null;
            if (faculty) {
                const res = await fetch(`/api/students?facultyId=${faculty.id}`);
                const data = await res.json();
                if (Array.isArray(data)) setStudents(data);
            }
        };
        fetchStudents();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final Validation check for prefix
        if (!formData.idNo.toUpperCase().startsWith(prefix)) {
            alert(`Oops! Student ID must start with your school's Unique ID: ${prefix}`);
            return;
        }

        const session = localStorage.getItem("faculty_session");
        const faculty = session ? JSON.parse(session) : null;

        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                school: schoolName,
                facultyId: faculty?.id
            }),
        });

        const data = await res.json();

        if (res.ok) {
            setStudents([data.student, ...students]);
            setFormData({
                name: "",
                idNo: "",
                area: "",
                age: "",
                class: "",
            });
            alert("Student Enrolled Successfully!");
        } else {
            alert(data.error || "Enrollment failed");
        }
    };

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
                        <label className="block text-sm font-semibold text-slate-700 mb-1">ID No. (Prefix: {prefix})</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={formData.idNo}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold uppercase"
                                placeholder={`${prefix}-1001`}
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase();
                                    if (val.length > 0 && !val.startsWith(prefix)) {
                                        e.target.setCustomValidity(`ID must start with your School Unique ID: ${prefix}`);
                                    } else {
                                        e.target.setCustomValidity('');
                                    }
                                    setFormData({ ...formData, idNo: val });
                                }}
                            />
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
