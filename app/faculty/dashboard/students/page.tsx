"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function StudentsForm() {
    const [prefix, setPrefix] = useState("EQ");
    const [schoolName, setSchoolName] = useState("Vajra International");
    const [formData, setFormData] = useState({
        name: "",
        idNo: "",
        age: "",
        class: "",
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const [students, setStudents] = useState<any[]>([]);
    const [isProfileActive, setIsProfileActive] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileAndStudents = async () => {
            const session = localStorage.getItem("faculty_session");
            const faculty = session ? JSON.parse(session) : null;
            if (faculty) {
                try {
                    // 1. Fetch real faculty profile status
                    const pRes = await fetch(`/api/faculty/profile?facultyId=${faculty.id}`);
                    const pData = await pRes.json();

                    if (!pRes.ok || !pData.isProfileActive) {
                        setIsProfileActive(false);
                        setLoading(false);
                        return;
                    }

                    setPrefix(pData.uniqueId);
                    setSchoolName(pData.schoolName);

                    // 2. Fetch students
                    const sRes = await fetch(`/api/students?facultyId=${faculty.id}`);
                    const sData = await sRes.json();
                    if (Array.isArray(sData)) setStudents(sData);
                } catch (error) {
                    console.error("Fetch error", error);
                }
            }
            setLoading(false);
        };
        fetchProfileAndStudents();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) { toast.error("Student Name is required"); return; }
        if (!formData.idNo.trim()) { toast.error("Student ID is required"); return; }
        if (!formData.age || parseInt(formData.age) < 5 || parseInt(formData.age) > 25) { toast.error("Please enter a valid age (5-25)"); return; }
        if (!formData.class) { toast.error("Please select a class"); return; }

        // Ensure ID is fully built with prefix if not already
        let finalId = formData.idNo.toUpperCase();
        if (!finalId.startsWith(prefix)) {
            finalId = `${prefix}-${finalId}`;
        }

        const session = localStorage.getItem("faculty_session");
        const faculty = session ? JSON.parse(session) : null;

        try {
            if (editingId) {
                // UPDATE Mode
                const res = await fetch('/api/students', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingId,
                        ...formData,
                        idNo: finalId,
                    }),
                });
                const data = await res.json();
                if (res.ok) {
                    setStudents(students.map(s => s._id === editingId ? data.student : s));
                    setEditingId(null);
                    toast.success("Student updated successfully!");
                } else {
                    toast.error(data.error || "Update failed");
                    return;
                }
            } else {
                // CREATE Mode
                const res = await fetch('/api/students', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        idNo: finalId,
                        school: schoolName,
                        facultyId: faculty?.id
                    }),
                });
                const data = await res.json();
                if (res.ok) {
                    setStudents([data.student, ...students]);
                    toast.success("Student Enrolled Successfully!");
                } else {
                    toast.error(data.error || "Enrollment failed");
                    return;
                }
            }

            // Reset Form
            setFormData({
                name: "",
                idNo: "",
                age: "",
                class: "",
            });
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (student: any) => {
        setEditingId(student._id);
        setFormData({
            name: student.name,
            idNo: student.idNo.includes('-') ? student.idNo.split('-')[1] : student.idNo,
            age: student.age || "",
            class: student.class,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this student?")) return;
        try {
            const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setStudents(students.filter(s => s._id !== id));
                toast.success("Student deleted successfully");
            } else {
                toast.error("Failed to delete");
            }
        } catch (err) {
            toast.error("Error deleting student");
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading activation status...</div>;

    if (!isProfileActive) {
        return (
            <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-slate-200 text-center">
                <div className="text-6xl mb-6">🔒</div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">School Profile Not Activated</h2>
                <p className="text-slate-500 mb-8 font-medium">Please configure your School Name and Unique ID in the Profile section before you can enroll students.</p>
                <a href="/faculty/dashboard/profile" className="px-8 py-3 bg-blue-700 text-white font-black rounded-xl hover:bg-blue-800 transition-all">
                    Go to Profile Setup
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span>{editingId ? '✏️' : '📝'}</span> {editingId ? 'Edit Student Details' : 'Enroll New Student'}
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
                        <div className="relative flex items-center">
                            <span className="absolute left-4 font-mono font-black text-slate-400">{prefix}-</span>
                            <input
                                type="text"
                                required
                                value={formData.idNo}
                                className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold uppercase"
                                placeholder="1001"
                                onChange={(e) => {
                                    const val = e.target.value.toUpperCase().replace(`${prefix}-`, '');
                                    setFormData({ ...formData, idNo: val });
                                }}
                            />
                        </div>
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
                    <div className="lg:col-span-3 flex justify-end gap-3">
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ name: "", idNo: "", age: "", class: "" });
                                }}
                                className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                        )}
                        <button type="submit" className="px-8 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-200 active:scale-[0.98]">
                            {editingId ? 'Update Student' : 'Register Student'}
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
                                    <td className="px-8 py-4 font-mono text-sm text-blue-600 font-bold">
                                        {student.idNo.includes('-') ? student.idNo : `${prefix}-${student.idNo}`}
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => !student.hasAttempted && handleEdit(student)}
                                            disabled={student.hasAttempted}
                                            className={`p-2 rounded-lg transition-colors ${student.hasAttempted
                                                ? "text-slate-300 cursor-not-allowed"
                                                : "text-blue-600 hover:bg-blue-50"
                                                }`}
                                            title={student.hasAttempted ? "Cannot edit: Student has attempted exam" : "Edit"}
                                        >
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(student._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                            🗑️
                                        </button>
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
