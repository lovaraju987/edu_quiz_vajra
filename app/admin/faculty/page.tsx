"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Faculty {
    _id: string;
    name: string;
    email: string;
    schoolName: string;
    phone: string;
    isProfileActive: boolean;
    createdAt: string;
}

export default function AdminFaculty() {
    const [facultyList, setFacultyList] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);

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

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch("/api/admin/faculty", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isProfileActive: !currentStatus }),
            });

            if (res.ok) {
                toast.success(currentStatus ? "Faculty deactivated" : "Faculty approved");
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

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Faculty Management</h1>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">School</th>
                            <th className="px-6 py-4">Email / Phone</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading faculty...</td></tr>
                        ) : facultyList.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No faculty registered yet.</td></tr>
                        ) : (
                            facultyList.map(faculty => (
                                <tr key={faculty._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{faculty.name}</div>
                                        <div className="text-xs text-slate-400">Reg: {new Date(faculty.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{faculty.schoolName}</td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">
                                        <div>{faculty.email}</div>
                                        <div className="text-xs">{faculty.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${faculty.isProfileActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {faculty.isProfileActive ? 'Active' : 'Pending Approval'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => toggleStatus(faculty._id, faculty.isProfileActive)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${faculty.isProfileActive
                                                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200'
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
    );
}
