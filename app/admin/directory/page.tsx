"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MENU_ITEMS } from "@/app/lib/constants";

interface School {
    _id: string;
    name: string;
    category: string;
    address: string;
    principalName: string;
    phone: string;
}

export default function AdminSchoolsPage() {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    useEffect(() => {
        fetchSchools();
    }, [selectedCategory]);

    const fetchSchools = async () => {
        try {
            setLoading(true);
            const url = selectedCategory
                ? `/api/schools?category=${selectedCategory}`
                : "/api/schools";
            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                setSchools(data.data);
            } else {
                toast.error(data.error || "Failed to fetch schools");
            }
        } catch (error) {
            toast.error("An error occurred while fetching schools");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this school?")) return;

        try {
            const res = await fetch(`/api/schools/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                toast.success("School deleted successfully");
                fetchSchools();
            } else {
                toast.error(data.error || "Failed to delete school");
            }
        } catch (error) {
            toast.error("An error occurred while deleting");
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Educational Directory</h1>
                <Link
                    href="/admin/directory/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Add Institution
                </Link>
            </div>

            <div className="mb-6">
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="p-2 border rounded-lg w-full max-w-md"
                >
                    <option value="">All Categories</option>
                    {MENU_ITEMS.map((item) => (
                        <option key={item.href} value={item.href.replace("/", "")}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Name & Principal
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Contact Details
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {schools.map((school) => {
                                    const categoryLabel = MENU_ITEMS.find(
                                        item => item.href === "/" + school.category || item.href === school.category
                                    )?.label || school.category;

                                    return (
                                        <tr key={school._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-900">
                                                    {school.name}
                                                </div>
                                                <div className="text-sm text-slate-500 mt-0.5">
                                                    {school.principalName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-700">
                                                    {categoryLabel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-900 font-medium">{school.phone}</div>
                                                <div className="text-sm text-slate-500 mt-0.5 min-w-[200px] max-w-xs whitespace-normal sm:whitespace-pre-wrap">
                                                    {school.address}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDelete(school._id)}
                                                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold uppercase tracking-wide"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {schools.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                                            No institutions found. Seed data or add a new one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
