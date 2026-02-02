"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function QuizAttemptContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const level = searchParams.get("level") || "1";
    const studentId = searchParams.get("id") || "Unknown";

    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 mins for 25 questions

    // Proctoring States
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [proctoringStatus, setProctoringStatus] = useState("Initializing AI...");

    useEffect(() => {
        // Start Camera for Proctoring View
        const startCamera = async () => {
            try {
                // Check if mediaDevices API is available (blocked on insecure origins like http://IP:PORT)
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    console.warn("Camera access unavailable. This usually happens on non-localhost HTTP connections.");
                    setProctoringStatus("OFFLINE MODE (CAMERA UNAVAILABLE)");
                    return;
                }

                // User asked for Audio handling too.
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                // Make sure we stop any previous stream if it exists (react strict mode safety)
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsCameraActive(true);
                    setProctoringStatus("STRICT AI MONITORING ACTIVE");
                }
            } catch (err) {
                console.error("Camera access denied", err);
                setProctoringStatus("CAMERA BLOCKED - FLAG RAISED");
            }
        };

        startCamera();

        return () => {
            stopCamera();
        };
    }, []);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop()); // Stops Video AND Audio
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch(`/api/quiz/questions?level=${level}&idNo=${studentId}`);

                if (res.status === 403) {
                    router.push("/results?error=already_attempted");
                    return;
                }

                const data = await res.json();
                if (Array.isArray(data)) {
                    setQuestions(data.map((q: any) => ({
                        q: q.text,
                        options: q.options,
                        a: q.answerIndex,
                        topic: q.category
                    })));
                } else {
                    alert(data.error || "Failed to load questions");
                }
            } catch (error) {
                console.error("Failed to fetch questions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();

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

    const handleFinish = async () => {
        stopCamera();
        setIsFinished(true);

        const resultData = {
            studentId,
            idNo: studentId,
            score,
            totalQuestions: questions.length,
            level,
            // Enhanced details for permanent saving
            studentName: localStorage.getItem(`student_name_${studentId}`) || "Student",
            schoolName: localStorage.getItem(`student_school_${studentId}`) || "School"
        };

        try {
            await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resultData),
            });
            localStorage.setItem(`attempted_${studentId}_${new Date().toDateString()}`, "true");

            // Store result for Header button visibility
            localStorage.setItem("last_quiz_score", score.toString());
            localStorage.setItem("last_quiz_total", questions.length.toString());
            localStorage.setItem("last_quiz_level", level);
            localStorage.setItem("show_result_button", "true");

        } catch (error) {
            console.error("Failed to save result", error);
        }

        setTimeout(() => {
            router.push(`/results?score=${score}&total=${questions.length}&level=${level}`);
        }, 2000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading || questions.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Generating Your Unique Quiz...</p>
            </div>
        );
    }

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
            <header className="bg-white border-b px-4 md:px-8 h-16 md:h-20 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2 md:gap-6">
                    <div className="flex flex-col">
                        <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Attempting Quiz</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-sm md:text-xl font-black text-[#002e5d] uppercase tracking-tighter">Level {level}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-12">
                    <div className="text-center">
                        <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Left</p>
                        <p className={`text-sm md:text-2xl font-mono font-black ${timeLeft < 300 ? 'text-red-600' : 'text-slate-800'}`}>
                            {formatTime(timeLeft)}
                        </p>
                    </div>
                    <div className="text-center hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Questions</p>
                        <p className="text-2xl font-black text-slate-800">{currentQuestion + 1} / {questions.length}</p>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
                                handleFinish();
                            }
                        }}
                        className="px-3 py-2 md:px-4 md:py-2 bg-red-50 text-red-600 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                        Exit
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto py-8 md:py-16 px-4 md:px-6">
                <div className="mb-6 md:mb-10 flex flex-col items-center gap-3">
                    <span className="px-5 py-2 bg-blue-700 text-white text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                        Topic: {questions[currentQuestion].topic}
                    </span>
                    <div className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Question {currentQuestion + 1} of {questions.length}
                    </div>
                </div>

                <div className="bg-white p-6 md:p-12 rounded-[30px] md:rounded-[50px] shadow-2xl shadow-blue-100 border border-slate-100 mb-8">
                    <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight mb-8 md:mb-12">
                        {questions[currentQuestion].q}
                    </h2>

                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                        {questions[currentQuestion].options.map((option: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                className="group w-full p-4 md:p-6 text-left bg-slate-50 hover:bg-[#002e5d] border-2 border-slate-100 hover:border-[#002e5d] rounded-2xl md:rounded-3xl transition-all duration-300 flex items-center justify-between active:scale-[0.99]"
                            >
                                <span className="font-bold text-sm md:text-lg text-slate-700 group-hover:text-white pr-4">{option}</span>
                                <div className="shrink-0 w-8 h-8 rounded-full bg-white border-2 border-slate-200 group-hover:bg-[#e11d48] group-hover:border-[#e11d48] flex items-center justify-center font-black text-xs text-slate-300 group-hover:text-white transition-all">
                                    {String.fromCharCode(65 + idx)}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                        Questions framed by EduQuiz AI
                    </p>
                </div>
            </main>

            {/* Proctoring Overlay (Mobile Optimized) */}
            <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-3 pointer-events-none">
                {/* Mirror View */}
                <div className="relative w-24 h-32 md:w-40 md:h-52 bg-black rounded-2xl md:rounded-[30px] overflow-hidden shadow-2xl border-2 border-white/20 backdrop-blur-md">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {!isCameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white text-[10px] font-black text-center p-2">
                            NO FEED
                        </div>
                    )}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600/90 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-[0.1em]">
                        <div className="w-1 h-1 rounded-full bg-white"></div>
                        Live
                    </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-col items-end gap-2">
                    <div className="bg-[#002e5d]/90 backdrop-blur-md text-white text-[7px] md:text-[9px] font-black px-3 py-1.5 rounded-xl border border-white/10 shadow-lg flex items-center gap-2 uppercase tracking-widest leading-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        {proctoringStatus}
                    </div>
                    <div className="bg-slate-900/40 backdrop-blur-sm text-slate-300 text-[6px] md:text-[8px] font-bold px-3 py-1 rounded-lg uppercase tracking-[0.2em] leading-none">
                        Session: {studentId}
                    </div>
                </div>
            </div>
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
