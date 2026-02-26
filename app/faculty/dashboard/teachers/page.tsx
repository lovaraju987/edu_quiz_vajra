"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

const FieldInput = ({ label, name, type = "text", value, onChange, placeholder, required = false }: any) => (
    <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
        <input
            required={required}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#002e5d] outline-none text-sm font-semibold transition-all text-slate-800"
        />
    </div>
);

export default function TeachersManagement() {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<any>(null);

    const emptyForm = { name: "", email: "", password: "", subject: "", phone: "" };
    const [formData, setFormData] = useState(emptyForm);
    const [editData, setEditData] = useState({ name: "", email: "", subject: "", phone: "", newPassword: "" });

    useEffect(() => { fetchTeachers(); }, []);

    const fetchTeachers = async () => {
        const session = localStorage.getItem("faculty_session");
        const faculty = session ? JSON.parse(session) : null;
        if (!faculty) return;
        try {
            const res = await fetch(`/api/faculty/teachers?schoolId=${faculty.id}`);
            if (res.ok) {
                const data = await res.json();
                setTeachers(data.teachers || []);
            }
        } catch { }
        finally { setIsLoading(false); }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const session = localStorage.getItem("faculty_session");
        const faculty = session ? JSON.parse(session) : null;
        if (!faculty) { toast.error("Session expired"); return; }
        try {
            const res = await fetch("/api/faculty/teachers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, schoolId: faculty.id, schoolName: faculty.schoolName }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Teacher added successfully!");
                setTeachers([...teachers, data.teacher]);
                setIsAddModalOpen(false);
                setFormData(emptyForm);
            } else { toast.error(data.error || "Failed to add teacher"); }
        } catch { toast.error("Network error"); }
        finally { setIsSubmitting(false); }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/faculty/teachers", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teacherId: editingTeacher._id, ...editData }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Teacher updated!");
                setTeachers(teachers.map(t => t._id === editingTeacher._id ? { ...t, ...editData } : t));
                setIsEditModalOpen(false);
            } else { toast.error(data.error || "Failed to update"); }
        } catch { toast.error("Network error"); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch(`/api/faculty/teachers?teacherId=${deleteTarget._id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Teacher deleted.");
                setTeachers(teachers.filter(t => t._id !== deleteTarget._id));
            } else { toast.error("Failed to delete"); }
        } catch { toast.error("Network error"); }
        finally { setDeleteTarget(null); }
    };

    const openEdit = (teacher: any) => {
        setEditingTeacher(teacher);
        setEditData({ name: teacher.name, email: teacher.email, subject: teacher.subject || "", phone: teacher.phone || "", newPassword: "" });
        setIsEditModalOpen(true);
    };

    const filtered = teachers.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Palette per index
    const palettes = [
        { bg: "from-[#002e5d] to-[#1e40af]", badge: "bg-blue-500" },
        { bg: "from-[#4c1d95] to-[#7c3aed]", badge: "bg-violet-500" },
        { bg: "from-[#064e3b] to-[#059669]", badge: "bg-emerald-500" },
        { bg: "from-[#7c2d12] to-[#ea580c]", badge: "bg-orange-500" },
        { bg: "from-[#1e3a5f] to-[#0e7490]", badge: "bg-cyan-500" },
    ];

    return (
        <div className="space-y-5">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Manage Teachers</h1>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        {teachers.length} teacher{teachers.length !== 1 ? "s" : ""} registered
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-[#002e5d] text-white px-5 py-2.5 rounded-xl text-sm font-black tracking-wide hover:bg-[#003d7a] transition-all shadow-lg shadow-blue-200/60 active:scale-95"
                >
                    <span className="text-base font-black">+</span> Add Teacher
                </button>
            </div>

            {/* ── Search ── */}
            <div className="relative max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search teachers..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#002e5d] outline-none text-sm font-medium text-slate-700 transition-all"
                />
            </div>

            {/* ── Cards Grid ── */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-52 bg-slate-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-3xl border border-slate-100">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <p className="text-slate-800 font-black text-base">{searchTerm ? "No results found" : "No Teachers Yet"}</p>
                    <p className="text-slate-400 text-xs mt-1">{searchTerm ? "Try a different keyword" : "Click \"Add Teacher\" to get started"}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((teacher: any, index: number) => {
                        const palette = palettes[index % palettes.length];
                        const initials = teacher.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "T";
                        return (
                            <div key={teacher._id || index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group">

                                {/* ── Top section (dark gradient) ── */}
                                <div className={`bg-gradient-to-br ${palette.bg} p-5 relative overflow-hidden`}>
                                    {/* Decorative circle */}
                                    <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
                                    <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-white/5" />

                                    <div className="relative flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-black text-lg shadow-inner">
                                                {initials}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-black text-base leading-tight">{teacher.name}</h3>
                                                <p className="text-white/50 text-[10px] font-mono font-bold mt-0.5 tracking-widest">{teacher.uniqueId || "—"}</p>
                                            </div>
                                        </div>
                                        {/* Status */}
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${teacher.isActive !== false ? 'bg-green-500/20 text-green-300 border border-green-400/30' : 'bg-red-500/20 text-red-300 border border-red-400/30'}`}>
                                            <span className="w-1.5 h-1.5 rounded-full inline-block bg-current" />
                                            {teacher.isActive !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    {/* Subject badge */}
                                    <div className="mt-3">
                                        <span className="inline-block text-[10px] font-black px-2.5 py-1 bg-white/15 text-white/90 rounded-lg border border-white/10 tracking-wider uppercase">
                                            {teacher.subject || "General"}
                                        </span>
                                    </div>
                                </div>

                                {/* ── Bottom section (white) ── */}
                                <div className="p-4">
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-slate-600 text-xs font-semibold truncate">{teacher.email}</span>
                                        </div>
                                        {teacher.phone && (
                                            <div className="flex items-center gap-2">
                                                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <span className="text-slate-600 text-xs font-semibold">{teacher.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-slate-400 text-xs font-medium">
                                                Joined {new Date(teacher.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => openEdit(teacher)}
                                            className="flex items-center justify-center gap-1.5 py-2 text-xs font-black text-[#002e5d] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(teacher)}
                                            className="flex items-center justify-center gap-1.5 py-2 text-xs font-black text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── ADD MODAL ─── */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 bg-gradient-to-r from-[#002e5d] to-[#1e40af]">
                            <h2 className="text-base font-black text-white">Add New Teacher</h2>
                            <p className="text-blue-200 text-xs mt-0.5">Fill in the details below to create a teacher account</p>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 space-y-3">
                            <FieldInput label="Full Name" name="name" value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ravi Kumar" required />
                            <FieldInput label="Email (Login ID)" name="email" type="email" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} placeholder="teacher@school.com" required />
                            <div className="grid grid-cols-2 gap-3">
                                <FieldInput label="Subject" name="subject" value={formData.subject} onChange={(e: any) => setFormData({ ...formData, subject: e.target.value })} placeholder="Physics" />
                                <FieldInput label="Phone" name="phone" type="tel" value={formData.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} placeholder="9876543210" />
                            </div>
                            <FieldInput label="Initial Password" name="password" value={formData.password} onChange={(e: any) => setFormData({ ...formData, password: e.target.value })} placeholder="Temporary password" required />
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 text-sm transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-[#002e5d] text-white font-black rounded-xl hover:bg-[#003d7a] text-sm disabled:opacity-50 shadow-lg shadow-blue-100 transition-all">
                                    {isSubmitting ? "Creating..." : "Create Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── EDIT MODAL ─── */}
            {isEditModalOpen && editingTeacher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-violet-600">
                            <h2 className="text-base font-black text-white">Edit Teacher</h2>
                            <p className="text-indigo-200 text-xs mt-0.5">Updating details for <strong>{editingTeacher.name}</strong></p>
                        </div>
                        <form onSubmit={handleEdit} className="p-6 space-y-3">
                            <FieldInput label="Full Name" value={editData.name} onChange={(e: any) => setEditData({ ...editData, name: e.target.value })} placeholder="Full name" required />
                            <FieldInput label="Email" type="email" value={editData.email} onChange={(e: any) => setEditData({ ...editData, email: e.target.value })} placeholder="Email" required />
                            <div className="grid grid-cols-2 gap-3">
                                <FieldInput label="Subject" value={editData.subject} onChange={(e: any) => setEditData({ ...editData, subject: e.target.value })} placeholder="Subject" />
                                <FieldInput label="Phone" type="tel" value={editData.phone} onChange={(e: any) => setEditData({ ...editData, phone: e.target.value })} placeholder="Phone" />
                            </div>
                            {/* Password Reset Section */}
                            <div className="mt-1 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">Reset Password (Optional)</p>
                                <FieldInput
                                    label="New Password — leave blank to keep current"
                                    type="text"
                                    value={editData.newPassword}
                                    onChange={(e: any) => setEditData({ ...editData, newPassword: e.target.value })}
                                    placeholder="Min 6 characters"
                                />
                                {editData.newPassword && editData.newPassword.length < 6 && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1">Password must be at least 6 characters</p>
                                )}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-black rounded-xl text-sm">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 text-sm disabled:opacity-50 transition-all">
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── DELETE CONFIRM ─── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-black text-slate-900">Delete Teacher?</h2>
                            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                                You are about to permanently delete <span className="font-black text-slate-700">{deleteTarget.name}</span>. This cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3 px-6 pb-6">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-black rounded-xl text-sm hover:bg-slate-200 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white font-black rounded-xl text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
