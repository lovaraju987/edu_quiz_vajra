import { notFound } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/db";
import School from "@/models/School";
import MainLayout from "@/app/components/MainLayout";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SchoolDetailPage({ params }: PageProps) {
    const { id } = await params;

    await dbConnect();

    let school;
    try {
        school = await School.findById(id);
    } catch (e) {
        notFound();
    }

    if (!school) {
        notFound();
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-5xl mx-auto">
                    <Link
                        href={`/` + school.category}
                        className="text-blue-600 hover:text-blue-800 font-medium mb-6 inline-block"
                    >
                        &larr; Back to List
                    </Link>

                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="h-64 bg-gradient-to-r from-blue-900 to-slate-800 relative">
                            <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/80 to-transparent">
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {school.name}
                                </h1>
                                <p className="text-white/80 text-lg">
                                    {school.address}
                                </p>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">About</h2>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {school.description || "No description available."}
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">Key Information</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <span className="block text-slate-500 text-sm mb-1">Principal / Head</span>
                                            <span className="text-slate-900 font-medium">{school.principalName}</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <span className="block text-slate-500 text-sm mb-1">Category</span>
                                            <span className="text-slate-900 font-medium capitalize">
                                                {school.category.replace(/-/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <div className="bg-blue-50 p-6 rounded-xl sticky top-8">
                                    <h3 className="text-lg font-bold text-blue-900 mb-4">Contact Details</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <span className="block text-blue-800/60 text-xs font-bold uppercase tracking-wider mb-1">
                                                Phone
                                            </span>
                                            <a href={`tel:${school.phone}`} className="text-blue-700 font-medium hover:underline">
                                                {school.phone}
                                            </a>
                                        </div>

                                        <div>
                                            <span className="block text-blue-800/60 text-xs font-bold uppercase tracking-wider mb-1">
                                                Email
                                            </span>
                                            <a href={`mailto:${school.email}`} className="text-blue-700 font-medium hover:underline break-all">
                                                {school.email}
                                            </a>
                                        </div>

                                        {school.website && (
                                            <div>
                                                <span className="block text-blue-800/60 text-xs font-bold uppercase tracking-wider mb-1">
                                                    Website
                                                </span>
                                                <a
                                                    href={school.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-700 font-medium hover:underline break-all"
                                                >
                                                    Visit Website
                                                </a>
                                            </div>
                                        )}

                                        <div>
                                            <span className="block text-blue-800/60 text-xs font-bold uppercase tracking-wider mb-1">
                                                Address
                                            </span>
                                            <p className="text-blue-900 text-sm">
                                                {school.address}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
