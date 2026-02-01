import MainLayout from "@/app/components/MainLayout";

export default function ScholarshipsPage() {
    return (
        <MainLayout>
            <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center">
                    <div className="w-20 h-20 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                        🎓
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4">Scholarships</h1>
                    <p className="text-slate-500 leading-relaxed mb-8">Information about our 1 lakh study scholarships and how to qualify by participating in daily quizzes.</p>
                </div>
            </div>
        </MainLayout>
    );
}
