"use client";

import { useEffect, useState } from "react";
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

    useEffect(() => {
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.idNo.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Students Management</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
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
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading students...</td></tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No students found.</td></tr>
                        ) : (
                            filteredStudents.map(student => (
                                <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{student.idNo}</td>
                                    <td className="px-6 py-4 text-slate-600">{student.class}</td>
                                    <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">{student.school}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(student._id)}
                                            className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Delete
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
