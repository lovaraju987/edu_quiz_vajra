
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function TeachersManagement() {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        uniqueId: "",
        password: "",
        subject: "",
        phone: ""
    });

    useEffect(() => {
        fetchTeachers();
    }, []);

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
        } catch (error) {
            console.error("Failed to load teachers");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const session = localStorage.getItem("faculty_session");
        const faculty = session ? JSON.parse(session) : null;

        if (!faculty) {
            toast.error("Session expired. Please login again.");
            return;
        }

        try {
            const res = await fetch("/api/faculty/teachers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    schoolId: faculty.id,
                    schoolName: faculty.schoolName
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Teacher added successfully");
                setTeachers([...teachers, data.teacher]);
                setIsModalOpen(false);
                setFormData({ name: "", email: "", uniqueId: "", password: "", subject: "", phone: "" });
            } else {
                toast.error(data.error || "Failed to add teacher");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Faculty Management</h1>
                    <p className="text-slate-500 text-sm">Manage your teaching staff and their access.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                    <span className="text-lg font-bold">+</span>
                    Add Teacher
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
                <input
                    type="text"
                    placeholder="Search by name, email or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
            </div>

            {/* Teachers Grid */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-400 animate-pulse">Loading teachers...</div>
            ) : filteredTeachers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">👨‍🏫</div>
                    <h3 className="text-lg font-bold text-slate-900">No Teachers Found</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">Start by adding your first teacher to the platform.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTeachers.map((teacher: any, index: number) => (
                        <div key={teacher._id || index} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                        {teacher.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 pointer-events-none">{teacher.name}</h3>
                                        <p className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1 font-bold">
                                            ID: <span className="text-blue-600">{teacher.uniqueId || "N/A"}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-600 mt-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-xs">✉️</span>
                                    <span className="truncate">{teacher.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-xs">📚</span>
                                    <span>{teacher.subject || "General"}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                                <span>Joined {new Date(teacher.createdAt).toLocaleDateString()}</span>
                                <span className={`px-2 py-0.5 rounded-full font-bold ${teacher.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {teacher.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Teacher Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">Add New Teacher</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                    <input required name="name" value={formData.name} onChange={handleInput} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Sarah Connor" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email <span className="text-red-500">* (Login ID)</span></label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleInput} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="teacher@school.com" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                                        <input name="subject" value={formData.subject} onChange={handleInput} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Physics" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Password</label>
                                    <input required type="text" name="password" value={formData.password} onChange={handleInput} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono bg-slate-50" placeholder="Set temporary password" />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50">
                                    {isSubmitting ? "Creating..." : "Create Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
