"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function DirectoryFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleSearch = useDebouncedCallback((term: string, type: 'name' | 'location') => {
        const params = new URLSearchParams(searchParams);

        // Reset pagination if implemented, or just update params
        if (term) {
            params.set(type === 'name' ? 'search' : 'location', term);
        } else {
            params.delete(type === 'name' ? 'search' : 'location');
        }

        router.replace(`?${params.toString()}`);
    }, 300);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-400">🔍</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Institution Name..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all outline-none"
                        onChange={(e) => handleSearch(e.target.value, 'name')}
                        defaultValue={searchParams.get('search')?.toString()}
                    />
                </div>

                {/* Location Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-400">📍</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by Location (e.g., Hyderabad)..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all outline-none"
                        onChange={(e) => handleSearch(e.target.value, 'location')}
                        defaultValue={searchParams.get('location')?.toString()}
                    />
                </div>
            </div>
        </div>
    );
}
