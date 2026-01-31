"use client";

import { useState } from "react";

export default function StudentsForm() {
    const [formData, setFormData] = useState({
        name: "",
        school: "",
        idNo: "",
        phNo: "",
        area: "",
        age: "",
        class: "",
    });

    const students = [
        { name: "Rahul Sharma", school: "Zila Parishad High School", idNo: "EQ-1001", status: "Active" },
        { name: "Sita Kumari", school: "Govt Boys School", idNo: "EQ-1002", status: "Active" },
        { name: "John Doe", school: "St. Xavier Academy", idNo: "EQ-1003", status: "Pending" },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span>📝</span> Enroll New Student
                </h2>
                <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Student Name</label>
                        <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Rahul Sharma" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">School Name</label>
                        <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Selected 10 schools" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">ID No.</label>
                        <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="EQ-XXXX" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                        <input type="tel" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+91 XXXX XXX XXX" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Area / Location</label>
                        <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="City / District" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
                            <input type="number" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="15" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Class</label>
                            <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="10th" />
                        </div>
                    </div>
                    <div className="lg:col-span-3 flex justify-end">
                        <button className="px-8 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-200 active:scale-[0.98]">
                            Register Student
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
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">ID</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((student) => (
                                <tr key={student.idNo} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="font-bold text-slate-800">{student.name}</div>
                                    </td>
                                    <td className="px-8 py-4 text-slate-600">{student.school}</td>
                                    <td className="px-8 py-4 font-mono text-sm text-blue-600 font-bold">{student.idNo}</td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button className="text-slate-400 hover:text-blue-700 transition-colors font-bold text-sm">Edit</button>
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
