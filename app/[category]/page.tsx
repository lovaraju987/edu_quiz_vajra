import { notFound } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/db";
import School from "@/models/School";
import { MENU_ITEMS } from "@/app/lib/constants";
import MainLayout from "@/app/components/MainLayout";
import DirectoryFilters from "@/app/components/DirectoryFilters";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
    const { category } = await params;
    const resolvedSearchParams = await searchParams;
    const searchTerm = resolvedSearchParams.search as string;
    const locationTerm = resolvedSearchParams.location as string;

    // Validate category
    const validCategory = MENU_ITEMS.find((item) => item.href === `/${category}`);
    if (!validCategory) {
        notFound();
    }

    await dbConnect();

    // Build Query
    const query: any = { category: category };

    if (searchTerm) {
        query.name = { $regex: searchTerm, $options: 'i' };
    }

    if (locationTerm) {
        query.address = { $regex: locationTerm, $options: 'i' };
    }

    const schools = await School.find(query).sort({ name: 1 });

    return (
        <MainLayout>
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {validCategory.label}
                    </h1>

                    <DirectoryFilters />

                    <p className="text-slate-600 mb-8">
                        Found {schools.length} results
                    </p>

                    {schools.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                            <p className="text-slate-500">No schools listed in this category yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {schools.map((school) => (
                                <Link
                                    href={`/schools/${school._id}`}
                                    key={school._id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group"
                                >
                                    <div className="h-48 bg-gray-200 relative">
                                        {/* Placeholder for image - can be replaced with actual image if available */}
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            <span className="text-4xl">🏫</span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                            {school.name}
                                        </h2>
                                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                            {school.address}
                                        </p>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                                                View Details
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
