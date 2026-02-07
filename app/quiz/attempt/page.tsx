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
        // Prevent changing the answer once selected (Locking)
        if (userAnswers[questionId] !== undefined) return;
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
                    {/* Proctoring Video - Moved to Header Center/Right */}
                    <div className="hidden md:flex flex-col items-center justify-center mr-4 relative group">
                        <div className="relative w-20 h-14 bg-black rounded-lg overflow-hidden shadow-md border border-slate-200">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                            {!isCameraActive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white text-[6px] font-black text-center p-1">
                                    OFFLINE
                                </div>
                            )}
                            <div className="absolute top-1 left-1 flex items-center gap-1 bg-red-600/90 text-white text-[6px] font-black px-1.5 py-0.5 rounded-full animate-pulse uppercase tracking-widest">
                                <div className="w-1 h-1 rounded-full bg-white"></div>
                                Live
                            </div>
                        </div>
                        {/* Status Tooltip */}
                        <div className="absolute top-full mt-2 bg-slate-800 text-white text-[8px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            {proctoringStatus}
                        </div>
                    </div>

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

            <main className="w-full px-2 md:px-6">
                <div className="flex flex-col gap-5 max-w-[98%] mx-auto w-full pb-6">
                    {/* Render each category group as a separate colored block */}
                    {sectionGroups.map((group, groupIdx) => {
                        // Determine color theme based on topic
                        const topicKey = group.topic.toUpperCase();
                        let bgClass = "bg-white";
                        let headerBg = "bg-slate-800";
                        let borderColor = "border-slate-800";

                        if (topicKey.includes("HEALTH")) {
                            bgClass = "bg-emerald-50";
                            headerBg = "bg-emerald-700";
                            borderColor = "border-emerald-700";
                        } else if (topicKey.includes("SCIENCE")) {
                            bgClass = "bg-sky-50";
                            headerBg = "bg-sky-700";
                            borderColor = "border-sky-700";
                        } else if (topicKey.includes("SPORTS")) {
                            bgClass = "bg-orange-50";
                            headerBg = "bg-orange-600";
                            borderColor = "border-orange-600";
                        } else if (topicKey.includes("GK") || topicKey.includes("GENERAL")) {
                            bgClass = "bg-violet-50";
                            headerBg = "bg-violet-700";
                            borderColor = "border-violet-700";
                        } else if (topicKey.includes("CORE") || topicKey.includes("HISTORY")) {
                            bgClass = "bg-indigo-50";
                            headerBg = "bg-indigo-700";
                            borderColor = "border-indigo-700";
                        }

                        return (
                            <div key={groupIdx} className={`shadow-lg rounded-xl overflow-hidden ${bgClass} border-2 ${borderColor}`}>
                                {/* Section Header */}
                                <div className={`${headerBg} text-white py-2 px-4 flex justify-between items-center`}>
                                    <h2 className="text-lg font-black uppercase tracking-widest">{group.topic}</h2>
                                    <span className="text-[10px] font-bold uppercase opacity-80 bg-white/20 px-2 py-0.5 rounded">
                                        5 Questions
                                    </span>
                                </div>

                                {/* Watermark effect */}
                                <div className="relative p-4 md:p-6">
                                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/crumpled-paper.png')]"></div>

                                    {/* Table Header inside the block */}
                                    <div className={`flex items-end border-b-2 ${borderColor} pb-1 mb-2 font-black uppercase text-[9px] md:text-[10px] tracking-wider opacity-70`}>
                                        <div className="flex-1 pl-1">Question</div>
                                        <div className="w-12 md:w-16 text-center">Result</div>
                                        <div className="w-12 md:w-16 text-center">Right</div>
                                        <div className="w-12 md:w-16 text-center">Score</div>
                                    </div>

                                    <div className="flex flex-col gap-0 relative z-10">
                                        {group.questions.map((q, idx) => {
                                            const questionNumber = (groupIdx * 5) + (idx + 1);
                                            const userAnswerIdx = userAnswers[q.id];
                                            const isAnswered = userAnswerIdx !== undefined;
                                            const isCorrect = isAnswered && userAnswerIdx === q.a;
                                            const correctOptionLabel = String.fromCharCode(97 + q.a) + ")"; // a), b)...

                                            return (
                                                <div key={q.id} className={`flex items-center py-2 border-b border-dashed ${borderColor.replace('border-', 'border-black/')}/20 hover:bg-white/40 transition-colors`}>
                                                    {/* Question Column */}
                                                    <div className="flex-1 pr-2 overflow-hidden">
                                                        <div className="flex gap-2 mb-1">
                                                            <span className={`font-black text-xs shrink-0 ${headerBg.replace('bg-', 'text-')}`}>Q.{questionNumber})</span>
                                                            <p className="font-bold text-slate-900 text-xs leading-tight truncate" title={q.q}>{q.q}</p>
                                                        </div>

                                                        {/* Options - FORCED SINGLE LINE */}
                                                        <div className="pl-5 flex flex-row flex-nowrap items-center gap-4 w-full overflow-x-auto no-scrollbar">
                                                            {q.options.map((opt: string, optIdx: number) => {
                                                                const isSelected = userAnswerIdx === optIdx;

                                                                // Styling for selected state (Paper style: underline or bold)
                                                                let optionClass = "text-slate-600 cursor-pointer hover:text-slate-900 transition-colors text-[10px] font-medium py-0.5 px-1.5 rounded flex items-center border border-transparent whitespace-nowrap shrink-0";
                                                                if (isAnswered) {
                                                                    optionClass += " cursor-default opacity-60"; // Dim others
                                                                    if (isSelected) optionClass = "text-slate-900 font-bold bg-white border-slate-300 shadow-sm py-0.5 px-1.5 rounded flex items-center text-[10px] whitespace-nowrap shrink-0"; // Highlight selected
                                                                } else {
                                                                    optionClass += " hover:bg-white/50 hover:border-slate-200";
                                                                }

                                                                return (
                                                                    <div
                                                                        key={optIdx}
                                                                        onClick={() => !isAnswered && handleSelectOption(q.id, optIdx)}
                                                                        className={optionClass}
                                                                    >
                                                                        <span className="mr-1 font-bold opacity-70">{String.fromCharCode(97 + optIdx)})</span>
                                                                        <span>{opt}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Result Column */}
                                                    <div className="w-12 md:w-16 shrink-0 flex items-center justify-center h-full">
                                                        {isAnswered ? (
                                                            <span className={`text-base font-black ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                                                {isCorrect ? '✓' : '✗'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 text-[10px] tracking-widest">...</span>
                                                        )}
                                                    </div>

                                                    {/* Right (Valid) Answer Column */}
                                                    <div className="w-12 md:w-16 shrink-0 flex items-center justify-center h-full">
                                                        {isAnswered ? (
                                                            <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0 rounded shadow-sm text-[10px] border border-slate-200">
                                                                {correctOptionLabel}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 text-[10px] tracking-widest">...</span>
                                                        )}
                                                    </div>

                                                    {/* Score Column */}
                                                    <div className="w-12 md:w-16 shrink-0 flex items-center justify-center h-full">
                                                        {isAnswered ? (
                                                            <span className="font-mono font-bold text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0 rounded">
                                                                {isCorrect ? '1' : '0'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 text-[10px] tracking-widest">...</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Final Submission Block - Inside the main column to match width */}
                    <div className="text-center pt-4 pb-8">
                        <button
                            onClick={handleFinish}
                            disabled={isSubmitting}
                            className="w-full bg-[#7209B7] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#5a0792] transition-all shadow-xl active:scale-95 disabled:opacity-50 text-xl"
                        >
                            {isSubmitting ? 'Submitting Result...' : 'Submit Final Exam'}
                        </button>
                    </div>
                </div>
            </main>

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
