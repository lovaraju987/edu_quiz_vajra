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
        password: "",
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showFormPassword, setShowFormPassword] = useState(false);

    const [students, setStudents] = useState<any[]>([]);
    const [isProfileActive, setIsProfileActive] = useState(true);
    const [loading, setLoading] = useState(true);
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

    const togglePasswordVisibility = (id: string) => {
        const newVisible = new Set(visiblePasswords);
        if (newVisible.has(id)) {
            newVisible.delete(id);
        } else {
            newVisible.add(id);
        }
        setVisiblePasswords(newVisible);
    };

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
        // ID and Password are now auto-generated for new students, so no client-side validation needed for them
        if (!formData.age || parseInt(formData.age) < 5 || parseInt(formData.age) > 25) { toast.error("Please enter a valid age (5-25)"); return; }
        if (!formData.class) { toast.error("Please select a class"); return; }

        const session = localStorage.getItem("faculty_session");
        const faculty = session ? JSON.parse(session) : null;

        try {
            if (editingId) {
                // UPDATE Mode
                // Ensure ID format is preserved or updated correctly
                let finalId = formData.idNo.toUpperCase();
                // If user edited ID (which they shoudn't really, but if they did), ensure prefix is handled?
                // Actually, let's assume for Edit mode we respect what's there.

                const res = await fetch('/api/students', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingId,
                        ...formData,
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
                        school: schoolName,
                        facultyId: faculty?.id,
                        prefix: prefix // Send prefix for auto-generation
                    }),
                });
                const data = await res.json();
                if (res.ok) {
                    setStudents([data.student, ...students]);

                    // Show credentials
                    toast.success(
                        <div className="space-y-2">
                            <p className="font-bold text-base">Student Enrolled!</p>
                            <div className="bg-slate-100 p-2 rounded text-slate-800 font-mono text-sm">
                                <div>ID: <span className="font-bold">{data.credentials.idNo}</span></div>
                                <div>Pass: <span className="font-bold">{data.credentials.password}</span></div>
                            </div>
                            <p className="text-xs">Credentials copied to clipboard</p>
                        </div>,
                        { duration: 10000 }
                    );
                    navigator.clipboard.writeText(`EduQuiz Login\nID: ${data.credentials.idNo}\nPassword: ${data.credentials.password}`);

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
                password: "",
            });
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (student: any) => {
        setEditingId(student._id);
        setFormData({
            name: student.name,
            idNo: student.idNo, // Keep full ID for edit
            age: student.age || "",
            class: student.class,
            password: "",
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
                    <div className="col-span-1 md:col-span-3 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                        <div className="text-2xl">ℹ️</div>
                        <div>
                            <h4 className="font-bold text-blue-900 text-sm">Automatic Enrollment</h4>
                            <p className="text-blue-700 text-xs mt-1">
                                Student ID and Password will be <strong>automatically generated</strong> upon enrollment.
                                You will be able to copy the credentials immediately after registration.
                            </p>
                        </div>
                    </div>

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

                    {editingId ? (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">ID No.</label>
                            <input
                                type="text"
                                disabled
                                value={formData.idNo}
                                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">ID No.</label>
                            <div className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 italic">
                                Auto-generated ({prefix}-YYYY-XXX)
                            </div>
                        </div>
                    )}

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

                    {editingId && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Reset Password (Optional)
                            </label>
                            <div className="relative group">
                                <input
                                    type={showFormPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12 transition-all font-mono"
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowFormPassword(!showFormPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all z-10"
                                    title={showFormPassword ? "Hide" : "Show"}
                                >
                                    {showFormPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="lg:col-span-3 flex justify-end gap-3">
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ name: "", idNo: "", age: "", class: "", password: "" });
                                }}
                                className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                        )}
                        <button type="submit" className="px-8 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-200 active:scale-[0.98]">
                            {editingId ? 'Update Student' : 'Generate & Register'}
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
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Password</th>
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
                                    <td className="px-8 py-4 font-mono text-sm text-slate-600 font-bold">
                                        <div className="flex items-center gap-3">
                                            <span>
                                                {visiblePasswords.has(student._id)
                                                    ? (student.displayPassword || "Encrypted (Reset Pwd)")
                                                    : "••••••"}
                                            </span>
                                            <button
                                                onClick={() => togglePasswordVisibility(student._id)}
                                                className={`p-1.5 rounded-lg transition-all border ${visiblePasswords.has(student._id)
                                                    ? "bg-blue-600 text-white border-blue-700"
                                                    : "bg-slate-50 text-slate-500 hover:text-blue-700 hover:bg-blue-50 border-slate-200"
                                                    }`}
                                                title={visiblePasswords.has(student._id) ? "Hide Password" : "Show Password"}
                                            >
                                                {visiblePasswords.has(student._id) ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
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
