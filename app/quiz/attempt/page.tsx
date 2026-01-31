"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function QuizAttemptContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const level = searchParams.get("level") || "1";
    const studentId = searchParams.get("id") || "Unknown";

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 mins for 25 questions

    // Mock AI Framed Questions (Easy Mode - High Fidelity)
    const questions = [
        { q: "Which fruit is known as the king of fruits in India?", options: ["Mango", "Apple", "Banana", "Orange"], a: 0, topic: "Health" },
        { q: "Who is known as the 'Iron Man of India'?", options: ["Mahatma Gandhi", "Sardar Patel", "Nehru", "Bose"], a: 1, topic: "History" },
        { q: "What is the capital city of France?", options: ["London", "Berlin", "Paris", "Rome"], a: 2, topic: "GK" },
        { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], a: 1, topic: "Science & Tech" },
        { q: "How many players are there in a cricket team?", options: ["9", "10", "11", "12"], a: 2, topic: "Sports" },
        // ... (truncated to 10 for demonstration, in real impl this would be 25)
        { q: "What is the primary source of Vitamin D for humans?", options: ["Milk", "Eggs", "Sunlight", "Bread"], a: 2, topic: "Health" },
        { q: "Who won the ICC T20 World Cup 2024?", options: ["Australia", "South Africa", "India", "Pakistan"], a: 2, topic: "Sports" },
        { q: "Which organ in our body filters blood?", options: ["Heart", "Lungs", "Kidneys", "Liver"], a: 2, topic: "Health" },
        { q: "What is the largest bone in the human body?", options: ["Skull", "Femur", "Ribs", "Spine"], a: 1, topic: "Science & Tech" },
        { q: "Who was the first Prime Minister of free India?", options: ["Rajendra Prasad", "Jawaharlal Nehru", "Indira Gandhi", "Lal Bahadur Shastri"], a: 1, topic: "History" },
    ];

    useEffect(() => {
        // Enforce Single Attempt
        const attempted = localStorage.getItem(`attempted_${studentId}_${new Date().toDateString()}`);
        if (attempted) {
            router.push("/results?error=already_attempted");
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    handleFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleAnswer = (index: number) => {
        if (index === questions[currentQuestion].a) {
            setScore(score + 1);
        }

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = () => {
        setIsFinished(true);
        localStorage.setItem(`attempted_${studentId}_${new Date().toDateString()}`, "true");
        // Redirect to results with score after 2 seconds
        setTimeout(() => {
            router.push(`/results?score=${score}&total=${questions.length}&level=${level}`);
        }, 2000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-[#002e5d] flex flex-col items-center justify-center text-white p-6 font-sans">
                <div className="text-8xl mb-8 animate-bounce">🎯</div>
                <h1 className="text-4xl font-black mb-4 tracking-tight uppercase">Quiz Submitted!</h1>
                <p className="text-blue-200 font-bold mb-8">Calculating your results and securing your rank...</p>
                <div className="w-64 h-2 bg-blue-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 animate-[progress_2s_ease-in-out]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Quiz Header */}
            <header className="bg-white border-b px-8 h-20 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Attempting Quiz</span>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-xl font-black text-[#002e5d] uppercase tracking-tighter">Level {level}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Left</p>
                        <p className={`text-2xl font-mono font-black ${timeLeft < 300 ? 'text-red-600' : 'text-slate-800'}`}>
                            {formatTime(timeLeft)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Questions</p>
                        <p className="text-2xl font-black text-slate-800">{currentQuestion + 1} / {questions.length}</p>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to exit? Your progress will be lost and today's attempt will be marked.")) {
                                handleFinish();
                            }
                        }}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                        Exit Quiz
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto py-16 px-6">
                <div className="mb-10 flex justify-center">
                    <span className="px-5 py-2 bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                        Topic: {questions[currentQuestion].topic}
                    </span>
                </div>

                <div className="bg-white p-12 rounded-[50px] shadow-2xl shadow-blue-100 border border-slate-100 mb-8">
                    <h2 className="text-3xl font-black text-slate-900 leading-tight mb-12">
                        {questions[currentQuestion].q}
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {questions[currentQuestion].options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className="group w-full p-6 text-left bg-slate-50 hover:bg-[#002e5d] border-2 border-slate-100 hover:border-[#002e5d] rounded-3xl transition-all duration-300 flex items-center justify-between active:scale-[0.99]"
                            >
                                <span className="font-bold text-lg text-slate-700 group-hover:text-white">{option}</span>
                                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 group-hover:bg-[#e11d48] group-hover:border-[#e11d48] flex items-center justify-center font-black text-xs text-slate-300 group-hover:text-white transition-all">
                                    {String.fromCharCode(65 + idx)}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">
                        Questions framed by EduQuiz AI • Easy Mode
                    </p>
                </div>
            </main>
        </div>
    );
}

export default function QuizAttemptPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <QuizAttemptContent />
        </Suspense>
    );
}
