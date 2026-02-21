"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

interface Faculty {
    _id: string;
    name: string;
    email: string;
    schoolName: string;
    phone: string;
    isProfileActive: boolean;
    createdAt: string;
    role: 'school_admin' | 'teacher';
    uniqueId?: string;
}

export default function AdminFaculty() {
    const [facultyList, setFacultyList] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters State
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterRole, setFilterRole] = useState("");

    const fetchFaculty = async () => {
        try {
            const res = await fetch("/api/admin/faculty");
            if (res.ok) {
                const data = await res.json();
                setFacultyList(data.faculty);
            } else {
                toast.error("Failed to load faculty");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean, role: string) => {
        try {
            const res = await fetch("/api/admin/faculty", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isProfileActive: !currentStatus, role }),
            });

            if (res.ok) {
                toast.success(currentStatus ? "Account deactivated" : "Account approved");
                // Optimistic update
                setFacultyList(prev => prev.map(f =>
                    f._id === id ? { ...f, isProfileActive: !currentStatus } : f
                ));
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const filteredFaculty = facultyList.filter(f => {
        const term = search.toLowerCase();
        const matchesSearch =
            f.name.toLowerCase().includes(term) ||
            f.email.toLowerCase().includes(term) ||
            f.schoolName.toLowerCase().includes(term) ||
            (f.uniqueId && f.uniqueId.toLowerCase().includes(term));

        const matchesStatus = filterStatus ? (
            filterStatus === "active" ? f.isProfileActive : !f.isProfileActive
        ) : true;

        const matchesRole = filterRole ? f.role === filterRole : true;

        return matchesSearch && matchesStatus && matchesRole;
    });

    const clearFilters = () => {
        setSearch("");
        setFilterStatus("");
        setFilterRole("");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Faculty Management</h1>

                <div className="flex flex-wrap items-center gap-3">

                    {/* Role Filter */}
                    <div className="relative">
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium cursor-pointer hover:border-blue-400 transition-colors w-36"
                        >
                            <option value="">All Roles</option>
                            <option value="school_admin">School Admin</option>
                            <option value="teacher">Teacher</option>
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-500 text-xs">▼</div>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium cursor-pointer hover:border-blue-400 transition-colors w-36"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-500 text-xs">▼</div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by Name, Email, or School..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
                        />
                        <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                    </div>

                    {(search || filterStatus || filterRole) && (
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
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Role & School</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 animate-pulse">Loading faculty...</td></tr>
                            ) : filteredFaculty.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    No faculty found matching your filters.
                                </td></tr>
                            ) : (
                                filteredFaculty.map(faculty => (
                                    <tr key={faculty._id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{faculty.name}</div>
                                            <div className="text-xs text-slate-400 mt-1 font-mono">
                                                Added: {new Date(faculty.createdAt).toLocaleDateString()}
                                                {faculty.uniqueId && ` • ID: ${faculty.uniqueId}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {faculty.role === 'school_admin' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-bold w-fit">
                                                        🏫 School Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold w-fit">
                                                        👨‍🏫 Teacher
                                                    </span>
                                                )}
                                                <div className="text-sm font-medium text-slate-600 truncate max-w-[200px]" title={faculty.schoolName}>
                                                    {faculty.schoolName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">EMAIL</span>
                                                <span className="text-sm">{faculty.email}</span>
                                            </div>
                                            {faculty.phone && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">PH</span>
                                                    <span className="text-sm font-mono">{faculty.phone}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${faculty.isProfileActive
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${faculty.isProfileActive ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                                {faculty.isProfileActive ? 'Active' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => toggleStatus(faculty._id, faculty.isProfileActive, faculty.role)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${faculty.isProfileActive
                                                    ? 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-red-500 hover:border-red-200'
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200'
                                                    }`}
                                            >
                                                {faculty.isProfileActive ? 'Deactivate' : 'Approve'}
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
                Showing {filteredFaculty.length} of {facultyList.length} faculty members
            </div>
        </div>
    );
}
