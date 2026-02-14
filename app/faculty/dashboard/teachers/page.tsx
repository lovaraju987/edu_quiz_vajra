"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function TeachersManagement() {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '' });
    const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<string | null>(null);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

    const fetchTeachers = async (adminId: string) => {
        try {
            const res = await fetch(`/api/faculty/teachers?adminId=${adminId}`);
            const data = await res.json();
            if (res.ok) setTeachers(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const session = localStorage.getItem("faculty_session");
        const faculty = session ? JSON.parse(session) : null;
        if (faculty && faculty.role === 'admin') {
            setIsAdmin(true);
            fetchTeachers(faculty.id);
        }
    }, []);

    const handleCreateTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingTeacher(true);
        const session = localStorage.getItem("faculty_session");
        const admin = session ? JSON.parse(session) : null;

        try {
            const res = await fetch('/api/faculty/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newTeacher, adminId: admin?.id })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Teacher ${data.teacher.name} created! Password: ${data.teacher.password}`);
                setTeachers([data.teacher, ...teachers]);
                setNewTeacher({ name: '', email: '', password: '' });
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Failed to create teacher");
        } finally {
            setIsCreatingTeacher(false);
        }
    };

    const handleUpdateTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingTeacher(true);

        try {
            const res = await fetch('/api/faculty/teachers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newTeacher, id: editingTeacher })
            });
            if (res.ok) {
                toast.success("Teacher account updated!");
                setTeachers(teachers.map(t => t._id === editingTeacher ? { ...t, ...newTeacher } : t));
                setNewTeacher({ name: '', email: '', password: '' });
                setEditingTeacher(null);
            } else {
                const data = await res.json();
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setIsCreatingTeacher(false);
        }
    };

    const handleDeleteTeacher = async (id: string) => {
        if (!confirm("Are you sure? This will not delete their students, but they won't be able to login.")) return;
        try {
            const res = await fetch(`/api/faculty/teachers?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTeachers(teachers.filter(t => t._id !== id));
                toast.success("Teacher account removed");
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
                <span className="text-5xl mb-4">🚫</span>
                <h3 className="text-xl font-bold text-slate-800">Access Restricted</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                    Only school administrators can manage faculty and teacher accounts.
                    Please contact your system administrator for access.
                </p>
            </div>
        );
    }

    return (
        <div id="teachers" className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-50">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Staff Management</h3>
                    <p className="text-slate-500 text-sm mt-1 uppercase font-bold tracking-widest text-[10px]">Administrative Control Panel</p>
                </div>
            </div>

            <div className="flex flex-col gap-10">
                {/* Create/Edit Form */}
                <form onSubmit={editingTeacher ? handleUpdateTeacher : handleCreateTeacher} className="w-full max-w-2xl mx-auto space-y-6 bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{editingTeacher ? '✏️' : '👤'}</span>
                        <h4 className="font-black text-slate-800 tracking-tight">{editingTeacher ? 'Edit Staff' : 'Add New Teacher'}</h4>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Rahul Sharma"
                                required
                                value={newTeacher.name}
                                onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                                className="w-full px-5 py-3 rounded-2xl border-2 border-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="teacher@school.com"
                                required
                                value={newTeacher.email}
                                onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
                                className="w-full px-5 py-3 rounded-2xl border-2 border-white focus:border-blue-600 outline-none transition-all font-bold text-slate-800 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Credential Secret</label>
                            <input
                                type="text"
                                placeholder={editingTeacher ? "Leave blank to keep same" : "e.g. Pass@123"}
                                required={!editingTeacher}
                                value={newTeacher.password}
                                onChange={e => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                className="w-full px-5 py-3 rounded-2xl border-2 border-white focus:border-blue-600 outline-none transition-all font-mono text-slate-800 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isCreatingTeacher}
                            className={`flex-1 py-4 text-white font-black rounded-2xl transition shadow-xl uppercase tracking-widest text-xs ${editingTeacher ? 'bg-amber-600 hover:bg-black shadow-amber-100' : 'bg-blue-700 hover:bg-black shadow-blue-100'}`}
                        >
                            {isCreatingTeacher ? 'Processing...' : (editingTeacher ? 'Save Changes' : 'Initialize Account')}
                        </button>
                        {editingTeacher && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingTeacher(null);
                                    setNewTeacher({ name: '', email: '', password: '' });
                                }}
                                className="px-6 py-4 bg-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-300 transition uppercase tracking-widest text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </form>

                {/* Teachers List */}
                <div className="w-full space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-800 tracking-tight text-lg">Active Faculty ({teachers.length})</h4>
                    </div>

                    {teachers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                            <span className="text-4xl mb-3 opacity-20">📂</span>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No staff accounts initialized</p>
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-slate-50 rounded-[2rem] overflow-hidden shadow-sm">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="col-span-4 pl-2">Faculty Member</div>
                                <div className="col-span-3">Contact</div>
                                <div className="col-span-3">Password</div>
                                <div className="col-span-2 text-right pr-2">Actions</div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-slate-50">
                                {teachers.map((teacher: any) => (
                                    <div key={teacher._id} className="grid grid-cols-12 gap-4 p-4 items-center group hover:bg-blue-50/30 transition-colors">
                                        <div className="col-span-4 pl-2">
                                            <p className="font-black text-slate-900 tracking-tight text-sm">{teacher.name}</p>
                                            <span className="text-[9px] font-bold text-blue-600 bg-blue-100/50 px-1.5 py-0.5 rounded border border-blue-100 inline-block mt-1">
                                                {teacher.uniqueId}
                                            </span>
                                        </div>
                                        <div className="col-span-3">
                                            <p className="text-xs font-bold text-slate-500">{teacher.email}</p>
                                        </div>
                                        <div className="col-span-3 flex items-center gap-2">
                                            <code className={`text-xs font-mono font-bold px-2 py-1 rounded transition-all ${visiblePasswords[teacher._id] ? 'text-slate-800 bg-slate-100' : 'text-slate-300 bg-slate-50'}`}>
                                                {visiblePasswords[teacher._id] ? (teacher.password || "No Password") : "••••••••"}
                                            </code>
                                            <button
                                                onClick={() => setVisiblePasswords(prev => ({ ...prev, [teacher._id]: !prev[teacher._id] }))}
                                                className="text-slate-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded-md"
                                                title={visiblePasswords[teacher._id] ? "Hide" : "Show"}
                                            >
                                                {visiblePasswords[teacher._id] ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.04 9.04 0 018.355 4.254s-.975 2.5-3.025 4.25m-1.95 2.2a4 4 0 01-5.656 5.656m-3.82-3.82a4 4 0 015.656-5.656" /></svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                )}
                                            </button>
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-1 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingTeacher(teacher._id);
                                                    setNewTeacher({ name: teacher.name, email: teacher.email, password: '' });
                                                }}
                                                className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Edit Teacher"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTeacher(teacher._id)}
                                                className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                title="Remove Teacher"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
