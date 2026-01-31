export default function PlaceholderPage({ title, description }: { title: string; description: string }) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center">
                <div className="w-20 h-20 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    ✨
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-4">{title}</h1>
                <p className="text-slate-500 leading-relaxed mb-8">{description}</p>
                <a href="/" className="inline-block px-8 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 shadow-lg transition-all">
                    Back to Home
                </a>
            </div>
        </div>
    );
}
