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

import { useSession } from "next-auth/react";

function QuizAttemptContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const level = searchParams.get("level") || "1";
    // @ts-ignore
    const studentId = session?.user?.idNo || "";

    const [QUIZ_DURATION, setQuizDuration] = useState(900); // Default 15 mins
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
    const timeLeftRef = useRef(QUIZ_DURATION);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/quiz/login");
        }
    }, [status, router]);

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

    // Load saved answers on mount
    useEffect(() => {
        const saved = localStorage.getItem(`quiz_answers_${studentId}`);
        if (saved) {
            try {
                setUserAnswers(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved answers");
            }
        }
    }, [studentId]);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!studentId) return; // Wait for session

            // 1. Try to load from LocalStorage first to prevent refresh-shuffling
            const savedQuestions = localStorage.getItem(`quiz_questions_${studentId}`);
            const savedLevel = localStorage.getItem(`quiz_level_${studentId}`);
            const savedDate = localStorage.getItem(`quiz_date_${studentId}`);
            const todayDate = new Date().toDateString();

            if (savedQuestions && savedLevel === level && savedDate === todayDate) {
                try {
                    const parsedQuestions = JSON.parse(savedQuestions);
                    if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
                        setQuestions(parsedQuestions);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to parse cached questions");
                }
            }

            try {
                const res = await fetch(`/api/quiz/questions?level=${level}&idNo=${studentId}`);
                if (res.status === 403) {
                    router.push("/quiz/results?error=already_attempted");
                    return;
                }
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
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

                    const finalQuestions = sortedData.map((q: any, index: number) => ({
                        id: index,
                        question: q.text,
                        options: q.options,
                        answer: q.answerIndex,
                        topic: q.category || "General"
                    }));

                    // 2. Cache the selected questions
                    setQuestions(finalQuestions);
                    localStorage.setItem(`quiz_questions_${studentId}`, JSON.stringify(finalQuestions));
                    localStorage.setItem(`quiz_level_${studentId}`, level);
                    localStorage.setItem(`quiz_date_${studentId}`, todayDate);
                } else {
                    toast.error(data.error || "No questions found for this level. Please contact admin.");
                    router.push('/student/dashboard');
                }
            } catch (error) {
                console.error("Failed to fetch questions", error);
            } finally {
                setLoading(false);
            }
        };

        const initQuiz = async () => {
            try {
                // 1. Fetch System Settings
                const settingsRes = await fetch("/api/admin/settings");
                let actualDuration = 900;
                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    if (settingsData.settings?.quizDuration) {
                        actualDuration = settingsData.settings.quizDuration;
                        setQuizDuration(actualDuration);
                    }
                }

                // 2. Fetch Questions
                await fetchQuestions();

                // 3. Initialize Timer
                const savedEndTime = localStorage.getItem(`quiz_endTime_${studentId}`);
                const now = Date.now();
                let targetTime: number;

                if (savedEndTime && parseInt(savedEndTime) > now) {
                    targetTime = parseInt(savedEndTime);
                    const initialLeft = Math.floor((targetTime - now) / 1000);
                    setTimeLeft(initialLeft);
                    timeLeftRef.current = initialLeft;
                } else {
                    targetTime = now + actualDuration * 1000;
                    localStorage.setItem(`quiz_endTime_${studentId}`, targetTime.toString());
                    setTimeLeft(actualDuration);
                    timeLeftRef.current = actualDuration;
                }

                const timer = setInterval(() => {
                    const currentNow = Date.now();
                    const secondsLeft = Math.floor((targetTime - currentNow) / 1000);

                    if (secondsLeft <= 0) {
                        setTimeLeft(0);
                        timeLeftRef.current = 0;
                        clearInterval(timer);
                        handleFinish();
                    } else {
                        setTimeLeft(secondsLeft);
                        timeLeftRef.current = secondsLeft;
                    }
                }, 1000);

                return timer;
            } catch (error) {
                console.error("Initialization failed", error);
            }
        };

        const timerPromise = initQuiz();
        return () => {
            timerPromise.then(timer => {
                if (timer) clearInterval(timer);
            });
        };
    }, [studentId]);

    const handleAnswerSelect = (questionId: number, optionIdx: number) => {
        // Prevent changing the answer once selected (Locking)
        if (userAnswers[questionId] !== undefined) return;
        const newAnswers = { ...userAnswers, [questionId]: optionIdx };
        setUserAnswers(newAnswers);
        localStorage.setItem(`quiz_answers_${studentId}`, JSON.stringify(newAnswers));
    };

    const handleFinish = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        stopCamera();

        // Calculate Score
        let score = 0;
        questions.forEach((q) => {
            if (userAnswers[q.id] === q.answer) {
                score++;
            }
        });

        setIsFinished(true);

        // Calculate time taken (initial time - remaining time)
        const timeTaken = QUIZ_DURATION - timeLeftRef.current;

        const resultData = {
            studentId: studentId.toUpperCase(),
            idNo: studentId.toUpperCase(),
            score,
            totalQuestions: questions.length,
            level,
            timeTaken, // Add time taken in seconds
            studentName: session?.user?.name || localStorage.getItem(`student_name_${studentId}`) || "Student",
            schoolName: localStorage.getItem(`student_school_${studentId}`) || "School"
        };

        try {
            const response = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resultData),
            });

            const data = await response.json();
            console.log('Quiz submitted:', data);

            localStorage.setItem(`attempted_${studentId}_${new Date().toDateString()}`, "true");
            localStorage.setItem("show_result_button", "true");

            // Clear Quiz Session Data
            localStorage.removeItem(`quiz_questions_${studentId}`);
            localStorage.removeItem(`quiz_answers_${studentId}`);
            localStorage.removeItem(`quiz_endTime_${studentId}`);
            localStorage.removeItem(`quiz_level_${studentId}`);
            localStorage.removeItem(`quiz_date_${studentId}`);
        } catch (error) {
            console.error("Failed to save result", error);
        }

        // Redirect to results page instead of dashboard
        setTimeout(() => {
            router.push(`/quiz/results?studentId=${studentId}`);
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
        <div className="h-screen overflow-hidden bg-slate-100 font-sans text-slate-900 flex flex-col select-none">
            <style>{selectionStyles}</style>

            {/* Exam Header - Fixed Height */}
            <header className="bg-white/95 backdrop-blur-md border-b px-2 md:px-8 h-16 md:h-20 flex items-center justify-between shrink-0 z-50 shadow-sm">
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden flex-1">
                    {/* Proctoring Video */}
                    <div className="relative group shrink-0">
                        <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[20px] bg-slate-100 overflow-hidden shadow-inner border-2 border-white ring-1 ring-slate-200">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                            {!isCameraActive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white text-[6px] font-black text-center p-1 uppercase">
                                    Off
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

                    <div className="flex flex-col min-w-0">
                        <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 md:mb-1">EXAM BUREAU OFFICIAL</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs md:text-2xl font-black text-[#7209B7] tracking-tighter uppercase truncate leading-tight">Level {level} Full Quiz</span>
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
                    <div className="text-center border-l-2 border-slate-100 pl-2 md:pl-12 hidden xs:block">
                        <p className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Progress</p>
                        <p className="text-sm md:text-2xl font-black text-slate-800">
                            {Object.keys(userAnswers).length} / {questions.length}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowExitModal(true)}
                        className="px-3 md:px-4 py-1.5 md:py-2 bg-red-50 text-red-600 rounded-lg md:rounded-xl text-[7px] md:text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100 whitespace-nowrap"
                    >
                        Abort
                    </button>
                </div>
            </header>

            {/* Main Content Area - Scrollable */}
            <main className="flex-1 overflow-y-auto w-full px-2 md:px-6 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300">
                <div className="max-w-6xl mx-auto w-full py-6 flex flex-col gap-6">
                    {sectionGroups.map((group, groupIdx) => {
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
                            <div key={groupIdx} className={`shadow-xl rounded-[30px] overflow-hidden ${bgClass} border-2 ${borderColor} transition-all duration-300`}>
                                {/* Section Header */}
                                <div className={`${headerBg} text-white py-3 px-6 flex justify-between items-center`}>
                                    <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">{groupIdx + 1}</span>
                                        {group.topic}
                                    </h2>
                                    <span className="text-[10px] font-black uppercase opacity-80 bg-white/20 px-3 py-1 rounded-full">
                                        {group.questions.length} Questions
                                    </span>
                                </div>

                                <div className="relative p-4 md:p-8">
                                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/crumpled-paper.png')]"></div>

                                    {/* Table Header inside the block - Hidden on Mobile */}
                                    {/* Paper Style Header */}
                                    <div className="hidden md:flex justify-end gap-12 border-b-2 border-slate-300 pb-1 mb-2 px-4">
                                        <div className="w-20 text-center font-bold text-slate-900 text-xs">Result</div>
                                        <div className="w-20 text-center font-bold text-slate-900 text-xs">Right</div>
                                        <div className="w-20 text-center font-bold text-slate-900 text-xs">Score</div>
                                    </div>

                                    <div className="flex flex-col gap-1 relative z-10">
                                        {group.questions.map((q, idx) => {
                                            const questionNumber = (groupIdx * 5) + (idx + 1);
                                            const userAnswerIdx = userAnswers[q.id];
                                            const isAnswered = userAnswerIdx !== undefined;
                                            const isCorrect = isAnswered && userAnswerIdx === q.answer;
                                            const correctOptionLabel = String.fromCharCode(65 + q.answer);

                                            return (
                                                <div key={q.id} className="relative py-1.5 border-b border-slate-200 border-dashed last:border-0 hover:bg-slate-50 transition-colors px-2 rounded-lg">
                                                    <div className="flex flex-col md:flex-row gap-1 justify-between items-start">

                                                        {/* Question & Options Section */}
                                                        <div className="flex-1 w-full">
                                                            {/* Question Text */}
                                                            <div className="flex gap-2 mb-1">
                                                                <span className="shrink-0 text-red-600 font-bold text-sm md:text-base">
                                                                    Q.{questionNumber})
                                                                </span>
                                                                <p className="font-bold text-slate-900 text-sm md:text-base leading-snug">
                                                                    {q.text || q.question}
                                                                </p>
                                                            </div>

                                                            {/* Options - Inline Paper Style */}
                                                            <div className="flex flex-wrap gap-x-2 gap-y-1 pl-4 md:pl-5">
                                                                {q.options.map((option: string, optIdx: number) => {
                                                                    const label = String.fromCharCode(97 + optIdx); // a, b, c, d
                                                                    const isSelected = userAnswers[q.id] === optIdx;

                                                                    return (
                                                                        <button
                                                                            key={optIdx}
                                                                            onClick={() => handleAnswerSelect(q.id, optIdx)}
                                                                            className={`text-[10px] md:text-xs font-medium transition-all text-left flex items-center gap-1.5 px-2 py-1 rounded-md border shadow-sm active:scale-95 ${isSelected
                                                                                ? 'bg-blue-700 border-blue-700 text-white shadow-blue-200'
                                                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                                }`}
                                                                        >
                                                                            <span className={`lowercase font-bold ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>{label})</span>
                                                                            <span>{option}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Result Columns - Paper Style */}
                                                        <div className="hidden md:flex gap-12 shrink-0 pt-1 font-bold text-xs">
                                                            {/* Result (Status) */}
                                                            <div className="w-20 border-b border-slate-300 h-6 flex items-center justify-center">
                                                                {isAnswered ? (
                                                                    isCorrect ? <span className="text-green-600 font-bold">Right</span> : <span className="text-red-500 font-bold">Wrong</span>
                                                                ) : ''}
                                                            </div>

                                                            {/* Right (Correct Answer) */}
                                                            <div className="w-20 border-b border-slate-300 h-6 flex items-center justify-center font-mono text-slate-900">
                                                                {isAnswered ? String.fromCharCode(97 + q.answer) : ''}
                                                            </div>

                                                            {/* Score (Point) */}
                                                            <div className="w-20 border-b border-slate-300 h-6 flex items-center justify-center text-blue-700">
                                                                {isAnswered ? (isCorrect ? '1' : '0') : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Final Submission Block */}
                    <div className="text-center pt-8 pb-12">
                        <button
                            onClick={handleFinish}
                            disabled={isSubmitting}
                            className="w-full max-w-md bg-[#7209B7] text-white py-5 rounded-[20px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-purple-200 hover:bg-[#5a0792] transition-all active:scale-95 disabled:opacity-50 text-xl border-b-8 border-[#4a0578]"
                        >
                            {isSubmitting ? 'Finalizing...' : 'Submit Full Exam'}
                        </button>
                    </div>
                </div>
            </main >

            {/* Exit Modal */}
            {
                showExitModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowExitModal(false)} />
                        <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 text-center border-4 border-red-50">
                            <div className="w-24 h-24 bg-red-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-5xl">⚠️</div>
                            <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Wait!</h3>
                            <p className="text-slate-500 font-bold leading-relaxed mb-10">
                                Exiting now will disqualify your attempt. Are you sure?
                            </p>
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => setShowExitModal(false)}
                                    className="w-full py-5 bg-slate-100 text-slate-600 rounded-[20px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    Continue Exam
                                </button>
                                <button
                                    onClick={() => {
                                        setShowExitModal(false);
                                        handleFinish();
                                    }}
                                    className="w-full py-5 bg-red-600 text-white rounded-[20px] font-black uppercase tracking-widest shadow-xl shadow-red-200 active:scale-95 transition-all"
                                >
                                    Exit & Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default function QuizAttemptPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center font-black bg-slate-900 text-white tracking-[0.5em] text-2xl animate-pulse">VALIDATING...</div>}>
            <QuizAttemptContent />
        </Suspense>
    );
}
