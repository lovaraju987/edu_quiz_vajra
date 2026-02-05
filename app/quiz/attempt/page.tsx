"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

// Global style for selection animation
const selectionStyles = `
  @keyframes selectPulse {
    0% { transform: scale(1); }
    50% { transform: scale(0.98); }
    100% { transform: scale(1); }
  }
  .answer-selected {
    animation: selectPulse 0.2s ease-in-out;
  }
`;

function QuizAttemptContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const level = searchParams.get("level") || "1";
    const studentId = searchParams.get("id") || "Unknown";

    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(900); // 15 mins
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Proctoring States
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [proctoringStatus, setProctoringStatus] = useState("Initializing AI...");
    const [showExitModal, setShowExitModal] = useState(false);

    // Topic Colors Mapping - 5 Unique High-Contrast Themes
    const topicColors: Record<string, { bg: string, border: string, text: string, accent: string }> = {
        "GK & CURRENT AFFAIRS": { bg: "bg-indigo-50/50", border: "border-indigo-200", text: "text-indigo-800", accent: "bg-indigo-600" },
        "SCIENCE": { bg: "bg-emerald-50/50", border: "border-emerald-200", text: "text-emerald-800", accent: "bg-emerald-600" },
        "SPORTS": { bg: "bg-orange-50/50", border: "border-orange-200", text: "text-orange-800", accent: "bg-orange-600" },
        "HEALTH": { bg: "bg-rose-50/50", border: "border-rose-200", text: "text-rose-800", accent: "bg-rose-600" },
        "CORE (BY CLASS)": { bg: "bg-purple-50/50", border: "border-purple-200", text: "text-purple-800", accent: "bg-purple-600" },
        "DEFAULT": { bg: "bg-slate-50/50", border: "border-slate-200", text: "text-slate-800", accent: "bg-slate-600" }
    };

    useEffect(() => {
        const startCamera = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    setProctoringStatus("OFFLINE MODE (CAMERA UNAVAILABLE)");
                    return;
                }
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
                setProctoringStatus("CAMERA BLOCKED - FLAG RAISED");
            }
        };

        startCamera();
        return () => stopCamera();
    }, []);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
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
                    // Normalize topic names and pre-sort by category
                    const normalizedData = data.map((q: any) => {
                        let cat = (q.category || "General").toUpperCase();
                        if (cat === "GK" || cat === "GENERAL KNOWLEDGE" || cat === "GENERAL KNOW") cat = "GK & CURRENT AFFAIRS";
                        if (cat === "HISTORY") cat = "CORE (BY CLASS)";
                        return { ...q, category: cat };
                    });

                    // Define preferred order for topics
                    const topicOrder = ["GK & CURRENT AFFAIRS", "SCIENCE", "SPORTS", "HEALTH", "CORE (BY CLASS)"];
                    const sortedData = [...normalizedData].sort((a, b) => {
                        const orderA = topicOrder.indexOf(a.category);
                        const orderB = topicOrder.indexOf(b.category);
                        if (orderA !== -1 && orderB !== -1) return orderA - orderB;
                        if (orderA !== -1) return -1;
                        if (orderB !== -1) return 1;
                        return (a.category || "").localeCompare(b.category || "");
                    });

                    setQuestions(sortedData.map((q: any, index: number) => ({
                        id: index,
                        q: q.text,
                        options: q.options,
                        a: q.answerIndex,
                        topic: q.category || "General"
                    })));
                } else {
                    toast.error(data.error || "Failed to load questions.");
                    router.push('/student/dashboard');
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

    const handleSelectOption = (questionId: number, optionIdx: number) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
    };

    const handleFinish = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        stopCamera();

        // Calculate Score
        let score = 0;
        questions.forEach((q) => {
            if (userAnswers[q.id] === q.a) {
                score++;
            }
        });

        setIsFinished(true);

        const resultData = {
            studentId: studentId.toUpperCase(),
            idNo: studentId.toUpperCase(),
            score,
            totalQuestions: questions.length,
            level,
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
            localStorage.setItem("show_result_button", "true");
        } catch (error) {
            console.error("Failed to save result", error);
        }

        setTimeout(() => {
            router.push(`/student/dashboard?completed=true&score=${score}&total=${questions.length}`);
        }, 2000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Grouping logic: Chunk into 5 sections of 5 questions each
    const sectionGroups: { topic: string, questions: any[] }[] = [];
    const questionsPerSection = 5;

    for (let i = 0; i < questions.length; i += questionsPerSection) {
        const chunk = questions.slice(i, i + questionsPerSection);
        if (chunk.length > 0) {
            sectionGroups.push({
                topic: chunk[0].topic.toUpperCase(),
                questions: chunk
            });
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-900 scroll-smooth pb-20">
            <style>{selectionStyles}</style>

            {/* Exam Header */}
            <header className="bg-white/95 backdrop-blur-md border-b px-2 md:px-8 h-16 md:h-20 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                    <div className="flex flex-col">
                        <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 md:mb-1">EXAM BUREAU OFFICIAL SCRIPT</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm md:text-2xl font-black text-[#7209B7] tracking-tighter uppercase whitespace-nowrap">Level {level} Full Quiz</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-12 shrink-0">
                    <div className="text-center">
                        <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Time Left</p>
                        <p className={`text-sm md:text-3xl font-mono font-black ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                            {formatTime(timeLeft)}
                        </p>
                    </div>
                    <div className="text-center hidden sm:block border-l-2 border-slate-100 pl-4 md:pl-12">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Progress</p>
                        <p className="text-xl md:text-2xl font-black text-slate-800">
                            {Object.keys(userAnswers).length} / {questions.length}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowExitModal(true)}
                        className="px-3 md:px-4 py-1.5 md:py-2 bg-red-50 text-red-600 rounded-lg md:rounded-xl text-[7px] md:text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
                    >
                        Abort
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4">
                {sectionGroups.map((group, gIdx) => {
                    const theme = topicColors[group.topic.toUpperCase()] || topicColors["DEFAULT"];
                    return (
                        <section
                            key={gIdx}
                            className={`${theme.bg} flex flex-col p-4 md:p-6 border-x-2 border-b-2 ${theme.border} relative overflow-hidden transition-all duration-500`}
                        >
                            {/* Section Topic Badge */}
                            <div className="absolute top-0 right-0 py-1.5 px-4 md:px-8 rounded-bl-2xl md:rounded-bl-3xl font-black text-[8px] md:text-[9px] tracking-widest uppercase text-white shadow-md z-10" style={{ backgroundColor: theme.accent.replace('bg-', '') }}>
                                {group.topic}
                            </div>

                            <h2 className={`text-sm md:text-lg font-black ${theme.text} mb-4 flex items-center gap-3 border-b ${theme.border} pb-2 pr-20 md:pr-0`}>
                                <span className={`w-2 h-2 rounded-full ${theme.accent}`}></span>
                                {group.topic}
                            </h2>

                            <div className="flex flex-col gap-4">
                                {group.questions.map((q) => (
                                    <div key={q.id} className="relative group">
                                        <div className="flex flex-col gap-1.5">
                                            <h3 className="text-[13px] md:text-sm font-black text-slate-800 leading-tight flex items-start gap-2">
                                                <span className={`${theme.text} opacity-30 shrink-0 tabular-nums`}>Q.{q.id + 1} )</span>
                                                {q.q}
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {q.options.map((option: string, idx: number) => {
                                                    const isSelected = userAnswers[q.id] === idx;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleSelectOption(q.id, idx)}
                                                            className={`
                                                                group w-full p-2 text-left rounded-xl transition-all duration-300 flex items-center justify-between
                                                                border-2 transform active:scale-[0.98]
                                                                ${isSelected
                                                                    ? `${theme.accent} border-transparent shadow-md text-white answer-selected`
                                                                    : `bg-white/90 border-slate-100/50 hover:border-${theme.accent.split('-')[1]}-200 hover:bg-white shadow-sm font-bold`
                                                                }
                                                            `}
                                                        >
                                                            <span className={`text-[10px] md:text-[12px] leading-tight pr-4 ${isSelected ? 'text-white' : 'text-slate-600'}`}>{option}</span>
                                                            <div className={`
                                                                shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center font-black text-[8px] transition-all
                                                                ${isSelected
                                                                    ? 'bg-white text-slate-800 border-white'
                                                                    : 'bg-slate-50 text-slate-300 border-slate-200 group-hover:bg-white group-hover:text-slate-500'
                                                                }
                                                            `}>
                                                                {String.fromCharCode(65 + idx)}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </section>
                    );
                })}

                {/* Final Submission Block (Full Viewport) */}
                <section className="flex items-center justify-center p-12 border-x-2 border-b-2 border-slate-200 bg-white">
                    <button
                        onClick={handleFinish}
                        disabled={isSubmitting}
                        className="bg-[#7209B7] text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#5a0792] transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Final Exam'}
                    </button>
                </section>
            </main>

            {/* Proctoring View (Compact Mirror) */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
                <div className="relative w-28 h-40 md:w-36 md:h-52 bg-black rounded-[24px] overflow-hidden shadow-2xl border border-white/20 backdrop-blur-md">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {!isCameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white text-[8px] font-black text-center p-2">
                            SYSTEM OFFLINE
                        </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 text-white text-[7px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest">
                        <div className="w-1 h-1 rounded-full bg-white"></div>
                        Live
                    </div>
                </div>
                <div className="bg-[#002e5d]/90 backdrop-blur-md text-white text-[8px] font-black px-3 py-1.5 rounded-xl border border-white/10 shadow-lg flex items-center gap-2 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    {proctoringStatus}
                </div>
            </div>

            {/* Exit Modal */}
            {showExitModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#002e5d]/40 backdrop-blur-sm" onClick={() => setShowExitModal(false)} />
                    <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 text-center border-2 border-red-50">
                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl">⚠️</div>
                        <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Warning!</h3>
                        <p className="text-slate-500 font-bold leading-relaxed mb-8">
                            Exiting now will disqualify your current attempt. Are you sure?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setShowExitModal(false)}
                                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                            >
                                Continue Exam
                            </button>
                            <button
                                onClick={() => {
                                    setShowExitModal(false);
                                    handleFinish();
                                }}
                                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-200 active:translate-y-1 transition-all"
                            >
                                Exit & Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function QuizAttemptPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black">VALIDATING CREDENTIALS...</div>}>
            <QuizAttemptContent />
        </Suspense>
    );
}
