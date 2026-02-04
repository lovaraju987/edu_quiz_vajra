// ... imports
"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Question {
    _id: string;
    text: string;
    options: string[];
    answerIndex: number;
    category: string;
    createdAt: string;
}

interface HistoryEntry {
    _id: string; // Date string YYYY-MM-DD
    count: number;
}

export default function AdminQuizzes() {
    const [viewMode, setViewMode] = useState<'none' | 'questions' | 'history'>('none');
    const [selectedLevel, setSelectedLevel] = useState<number>(0);
    const [selectedDate, setSelectedDate] = useState<string>("");

    const [questions, setQuestions] = useState<Question[]>([]);
    const [historyList, setHistoryList] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);

    const levels = ['Level 1 (4th-6th)', 'Level 2 (7th-8th)', 'Level 3 (9th-10th)'];

    const handleViewQuestions = async (levelIndex: number) => {
        setLoading(true);
        setSelectedLevel(levelIndex + 1);
        setSelectedDate("Today's Active Quiz");
        setViewMode('questions');

        try {
            const res = await fetch(`/api/admin/quiz/current?level=${levelIndex + 1}`);
            const data = await res.json();
            if (res.ok) {
                setQuestions(data.questions);
            } else {
                toast.error("Failed to load questions");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const handleViewHistory = async (levelIndex: number) => {
        setLoading(true);
        setSelectedLevel(levelIndex + 1);
        setViewMode('history');

        try {
            const res = await fetch(`/api/admin/quiz/history?level=${levelIndex + 1}`);
            const data = await res.json();
            if (res.ok) {
                setHistoryList(data.history);
            } else {
                toast.error("Failed to load history");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const handleHistoryDateClick = async (date: string) => {
        setLoading(true);
        setSelectedDate(date);
        setViewMode('questions'); // Switch to questions view

        try {
            const res = await fetch(`/api/admin/quiz/history?level=${selectedLevel}&date=${date}`);
            const data = await res.json();
            if (res.ok) {
                setQuestions(data.questions);
            } else {
                toast.error("Failed to load past quiz");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const closeModals = () => {
        setViewMode('none');
        setQuestions([]);
        setHistoryList([]);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Quiz Management</h1>
                <button className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                    ✨ Generate New Quiz (AI)
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {levels.map((level, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
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
                                <span className="font-bold">--</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                            <button
                                onClick={() => handleViewQuestions(i)}
                                className="flex-1 py-2 text-blue-600 font-bold bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                            >
                                View Questions
                            </button>
                            <button
                                onClick={() => handleViewHistory(i)}
                                className="flex-1 py-2 text-slate-600 font-bold bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-sm"
                            >
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

            {/* Questions Modal */}
            {viewMode === 'questions' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">Quiz Content</h3>
                                <p className="text-sm text-slate-500 font-medium">{levels[selectedLevel - 1]} • {selectedDate}</p>
                            </div>
                            <button onClick={closeModals} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-lg transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-6">
                            {loading ? (
                                <div className="py-20 text-center text-slate-500 animate-pulse">Loading questions...</div>
                            ) : questions.length === 0 ? (
                                <div className="py-20 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    No questions found for this quiz.
                                </div>
                            ) : (
                                questions.map((q, idx) => (
                                    <div key={q._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                        <div className="flex gap-3 mb-3">
                                            <span className="bg-blue-100 text-blue-700 w-8 h-8 flex items-center justify-center rounded-lg font-bold shrink-0 text-sm">
                                                {idx + 1}
                                            </span>
                                            <h4 className="font-bold text-slate-800 text-lg leading-tight pt-0.5">{q.text}</h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                                            {q.options.map((opt, optIdx) => (
                                                <div
                                                    key={optIdx}
                                                    className={`px-4 py-3 rounded-lg text-sm font-medium border transition-colors flex items-center justify-between
                                                        ${optIdx === q.answerIndex
                                                            ? 'bg-green-50 border-green-200 text-green-800'
                                                            : 'bg-slate-50 border-slate-100 text-slate-600'
                                                        }`}
                                                >
                                                    {opt}
                                                    {optIdx === q.answerIndex && (
                                                        <span className="text-green-600">✓</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pl-11 mt-2 text-xs text-slate-400 font-medium uppercase tracking-wide">
                                            Category: {q.category}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {viewMode === 'history' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">Quiz History</h3>
                                <p className="text-sm text-slate-500 font-medium">{levels[selectedLevel - 1]}</p>
                            </div>
                            <button onClick={closeModals} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-lg transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-4">
                            {loading ? (
                                <div className="py-12 text-center text-slate-500 animate-pulse">Loading history...</div>
                            ) : historyList.length === 0 ? (
                                <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    No history available.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {historyList.map((entry) => (
                                        <button
                                            key={entry._id}
                                            onClick={() => handleHistoryDateClick(entry._id)}
                                            className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                                    📅
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                                        {entry._id}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-medium">
                                                        {entry.count} Questions Generated
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-slate-300 group-hover:text-blue-500 transition-colors">→</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
