export default function AdminQuizzes() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Quiz Management</h1>
                <button className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                    ✨ Generate New Quiz (AI)
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {['Level 1 (4th-6th)', 'Level 2 (7th-8th)', 'Level 3 (9th-10th)'].map((level, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-slate-800">{level}</h3>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Today's Quiz Active</span>
                        </div>
                        <p className="text-slate-500 text-sm mb-6">Topic: General Science</p>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Questions</span>
                                <span className="font-bold">25</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Participants</span>
                                <span className="font-bold">142</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                            <button className="flex-1 py-2 text-blue-600 font-bold bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                                View Questions
                            </button>
                            <button className="flex-1 py-2 text-slate-600 font-bold bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-sm">
                                History
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-center gap-4">
                <div className="text-3xl">🤖</div>
                <div>
                    <h4 className="font-bold text-blue-900">AI Auto-Scheduler Active</h4>
                    <p className="text-blue-700 text-sm">Next batch of quizzes will be generated automatically at 00:00 AM.</p>
                </div>
            </div>
        </div>
    );
}
