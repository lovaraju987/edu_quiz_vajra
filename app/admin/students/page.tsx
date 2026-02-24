"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 50;
const CLASS_OPTIONS = ['4th', '5th', '6th', '7th', '8th', '9th', '10th'];

interface Student {
    _id: string;
    name: string;
    idNo: string;
    class: string;
    school: string;
    status: string;
    createdAt: string;
    displayPassword?: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export default function AdminStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterClass, setFilterClass] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Modals
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: "", class: "", school: "" });
    const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});

    // ─── Debounce Search (300ms) ─────────────────────────────────────────
    // Search now hits the API so we debounce to avoid a request on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);  // Reset to page 1 on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset to page 1 when class filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterClass]);

    // ─── Fetch Students (Server-side pagination + search) ────────────────
    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(ITEMS_PER_PAGE),
            });
            if (debouncedSearch) params.set('search', debouncedSearch);
            if (filterClass) params.set('class', filterClass);

            const res = await fetch(`/api/admin/students?${params}`);
            if (res.ok) {
                const data = await res.json();
                setStudents(data.students);
                setPagination(data.pagination);
            } else {
                toast.error("Failed to load students");
            }
        } catch {
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, filterClass]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // ─── Toggle Password Visibility ──────────────────────────────────────
    const togglePassword = (id: string) => {
        setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // ─── Clear Filters ───────────────────────────────────────────────────
    const clearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setFilterClass("");
        setCurrentPage(1);
    };

    // ─── Add Student ─────────────────────────────────────────────────────
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStudent),
            });
            const data = await res.json();
            if (res.ok) {
                setIsAdding(false);
                setNewStudent({ name: "", class: "", school: "" });
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
                // Refresh current page to show new student
                fetchStudents();
            } else {
                toast.error(data.error || "Failed to add student");
            }
        } catch {
            toast.error("Error connecting to server");
        }
    };

    // ─── Delete Student ──────────────────────────────────────────────────
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
                fetchStudents();  // Refresh — server recalculates page
            } else {
                throw new Error("Failed to delete");
            }
        } catch {
            toast.error("Delete failed");
        }
    };

    // ─── Update Student ──────────────────────────────────────────────────
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
        } catch {
            toast.error("Update failed");
        }
    };

    // ─── Pagination Controls ─────────────────────────────────────────────
    const pageNumbers = useMemo(() => {
        if (!pagination) return [];
        const total = pagination.totalPages;
        const current = currentPage;
        const pages: (number | '...')[] = [];

        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        pages.push(1);
        if (current > 3) pages.push('...');
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
            pages.push(i);
        }
        if (current < total - 2) pages.push('...');
        pages.push(total);

        return pages;
    }, [pagination, currentPage]);

    return (
        <div className="space-y-6">
            {/* ── Add Student Modal ─────────────────────────────────────── */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">Add New Student</h3>
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 space-y-4">
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                                <p className="text-sm text-blue-700 font-medium">
                                    <span className="font-bold">Note:</span> Student ID and Password will be auto-generated upon creation.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Student Name</label>
                                    <input
                                        type="text" required
                                        value={newStudent.name}
                                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                        placeholder="Enter full student name"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Class</label>
                                        <select
                                            required
                                            value={newStudent.class}
                                            onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Select</option>
                                            {CLASS_OPTIONS.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">School</label>
                                        <input
                                            type="text" required
                                            value={newStudent.school}
                                            onChange={(e) => setNewStudent({ ...newStudent, school: e.target.value })}
                                            placeholder="Enter school name"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsAdding(false)}
                                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                                    Generate &amp; Enroll
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Modal ────────────────────────────────────────────── */}
            {editingStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">Edit Student</h3>
                            <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                                    <input type="text" required value={editingStudent.name}
                                        onChange={e => setEditingStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID No</label>
                                    <input type="text" disabled value={editingStudent.idNo}
                                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 font-mono text-sm cursor-not-allowed"
                                        title="ID cannot be changed"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">School</label>
                                <input type="text" required value={editingStudent.school}
                                    onChange={e => setEditingStudent(prev => prev ? { ...prev, school: e.target.value } : null)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class</label>
                                    <input type="text" required value={editingStudent.class}
                                        onChange={e => setEditingStudent(prev => prev ? { ...prev, class: e.target.value } : null)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                    <select value={editingStudent.status}
                                        onChange={e => setEditingStudent(prev => prev ? { ...prev, status: e.target.value } : null)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setEditingStudent(null)}
                                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Students Management</h1>
                    {pagination && (
                        <p className="text-sm text-slate-500 mt-1">
                            {pagination.total.toLocaleString()} total students enrolled
                        </p>
                    )}
                </div>
                <button onClick={() => setIsAdding(true)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2">
                    <span className="text-lg">+</span> Add Student
                </button>
            </div>

            {/* ── Filters ──────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium cursor-pointer hover:border-blue-400 transition-colors w-32"
                    >
                        <option value="">All Classes</option>
                        {CLASS_OPTIONS.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none text-slate-500 text-xs">▼</div>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by Name, ID, or School..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-72 shadow-sm"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                    {/* Typing indicator — shows when debounce is pending */}
                    {search !== debouncedSearch && (
                        <span className="absolute right-3 top-3 w-2 h-2 rounded-full bg-blue-400 animate-pulse" title="Searching..." />
                    )}
                </div>

                {(search || filterClass) && (
                    <button onClick={clearFilters}
                        className="px-4 py-2 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200">
                        Clear
                    </button>
                )}
            </div>

            {/* ── Table ────────────────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">ID No</th>
                                <th className="px-6 py-4">Password</th>
                                <th className="px-6 py-4">Class</th>
                                <th className="px-6 py-4">School</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 7 }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="text-4xl mb-3">🔍</div>
                                        <p className="text-slate-500 font-medium">No students found matching your filters.</p>
                                        {(search || filterClass) && (
                                            <button onClick={clearFilters} className="mt-3 text-blue-500 text-sm hover:underline">
                                                Clear filters
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                students.map(student => (
                                    <tr key={student._id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{student.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200 font-bold">
                                                {student.idNo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {student.displayPassword ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={visiblePasswords[student._id]
                                                        ? "font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded"
                                                        : "text-slate-400 tracking-widest text-lg leading-none"}>
                                                        {visiblePasswords[student._id] ? student.displayPassword : "••••••"}
                                                    </span>
                                                    <button
                                                        onClick={() => togglePassword(student._id)}
                                                        className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                                        title={visiblePasswords[student._id] ? "Hide" : "Show Password"}
                                                    >
                                                        {visiblePasswords[student._id] ? (
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
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Changed</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{student.class}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="truncate max-w-[150px]" title={student.school}>{student.school}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button onClick={() => setEditingStudent(student)}
                                                className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Edit Student">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDelete(student._id)}
                                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Delete Student">
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

            {/* ── Pagination Controls ───────────────────────────────────── */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Info */}
                    <p className="text-sm text-slate-500 font-medium">
                        Showing{" "}
                        <span className="font-bold text-slate-900">
                            {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-slate-900">{pagination.total.toLocaleString()}</span>{" "}
                        students
                    </p>

                    {/* Page Buttons */}
                    <div className="flex items-center gap-1">
                        {/* First */}
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={!pagination.hasPrevPage}
                            className="px-2 py-1.5 text-sm font-bold rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="First page"
                        >
                            «
                        </button>

                        {/* Prev */}
                        <button
                            onClick={() => setCurrentPage(p => p - 1)}
                            disabled={!pagination.hasPrevPage}
                            className="px-3 py-1.5 text-sm font-bold rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            ‹ Prev
                        </button>

                        {/* Page Numbers */}
                        {pageNumbers.map((pg, i) =>
                            pg === '...' ? (
                                <span key={`dots-${i}`} className="px-2 py-1.5 text-slate-400 text-sm">…</span>
                            ) : (
                                <button
                                    key={pg}
                                    onClick={() => setCurrentPage(pg as number)}
                                    className={`min-w-[36px] px-3 py-1.5 text-sm font-bold rounded-lg transition-all ${currentPage === pg
                                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                                            : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {pg}
                                </button>
                            )
                        )}

                        {/* Next */}
                        <button
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={!pagination.hasNextPage}
                            className="px-3 py-1.5 text-sm font-bold rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Next ›
                        </button>

                        {/* Last */}
                        <button
                            onClick={() => setCurrentPage(pagination.totalPages)}
                            disabled={!pagination.hasNextPage}
                            className="px-2 py-1.5 text-sm font-bold rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Last page"
                        >
                            »
                        </button>
                    </div>
                </div>
            )}

            {/* Simple count when only 1 page */}
            {pagination && pagination.totalPages <= 1 && (
                <div className="text-right text-xs text-slate-400 font-medium">
                    Showing {students.length} of {pagination.total} students
                </div>
            )}
        </div>
    );
}
