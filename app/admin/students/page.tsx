"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

interface Student {
    _id: string;
    name: string;
    idNo: string;
    class: string;
    school: string;
    status: string;
    createdAt: string;
}

export default function AdminStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterClass, setFilterClass] = useState("");

    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/admin/students");
            if (res.ok) {
                const data = await res.json();
                setStudents(data.students);
            } else {
                toast.error("Failed to load students");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this student?")) return;

        try {
            const res = await fetch("/api/admin/students", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                toast.success("Student deleted successfully");
                setStudents(students.filter(s => s._id !== id));
            } else {
                throw new Error("Failed to delete");
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;

        try {
            const res = await fetch("/api/admin/students", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingStudent._id,
                    name: editingStudent.name,
                    idNo: editingStudent.idNo,
                    class: editingStudent.class,
                    school: editingStudent.school,
                    status: editingStudent.status
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setStudents(students.map(s => s._id === editingStudent._id ? data.student : s));
                setEditingStudent(null);
                toast.success("Student updated successfully");
            } else {
                throw new Error("Failed to update");
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Extract unique options for dropdowns
    const uniqueClasses = useMemo(() => {
        return Array.from(new Set(students.map(s => s.class))).sort();
    }, [students]);

    const filteredStudents = students.filter(s => {
        const term = search.toLowerCase();
        const matchesSearch =
            s.name.toLowerCase().includes(term) ||
            s.idNo.toLowerCase().includes(term) ||
            s.school.toLowerCase().includes(term);

        const matchesClass = filterClass ? s.class === filterClass : true;

        return matchesSearch && matchesClass;
    });

    const clearFilters = () => {
        setSearch("");
        setFilterClass("");
    };

    return (
        <div className="space-y-6">
            {/* Edit Modal */}
            {editingStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">Edit Student</h3>
                            <button
                                onClick={() => setEditingStudent(null)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingStudent.name}
                                        onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID No</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingStudent.idNo}
                                        onChange={e => setEditingStudent({ ...editingStudent, idNo: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">School</label>
                                <input
                                    type="text"
                                    required
                                    value={editingStudent.school}
                                    onChange={e => setEditingStudent({ ...editingStudent, school: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingStudent.class}
                                        onChange={e => setEditingStudent({ ...editingStudent, class: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                    <select
                                        value={editingStudent.status}
                                        onChange={e => setEditingStudent({ ...editingStudent, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingStudent(null)}
                                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Students Management</h1>

                {/* Filters Section */}
                <div className="flex flex-wrap items-center gap-3">

                    {/* Unique Class Filter */}
                    <div className="relative">
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium cursor-pointer hover:border-blue-400 transition-colors w-32"
                        >
                            <option value="">All Classes</option>
                            {uniqueClasses.map(cls => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-500 text-xs">▼</div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Name, ID or School..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-72 shadow-sm"
                        />
                        <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                    </div>

                    {(search || filterClass) && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs hover:bg-slate-100 transition-colors">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">ID No</th>
                                <th className="px-6 py-4">Class</th>
                                <th className="px-6 py-4">School</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 animate-pulse">Loading students...</td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    No students found matching your filters.
                                </td></tr>
                            ) : (
                                filteredStudents.map(student => (
                                    <tr key={student._id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{student.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                                                {student.idNo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {student.class}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="truncate max-w-[200px]" title={student.school}>
                                                {student.school}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingStudent(student)}
                                                className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Edit Student"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student._id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Delete Student"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-right text-xs text-slate-400 font-medium">
                Showing {filteredStudents.length} of {students.length} students
            </div>
        </div>
    );
}
