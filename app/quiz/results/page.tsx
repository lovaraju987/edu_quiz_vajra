"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

function QuizResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [resultData, setResultData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState<any>(null);

    const studentId = searchParams.get('idNo') || searchParams.get('studentId');
    const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');

    useEffect(() => {
        if (!studentId) {
            router.push('/');
            return;
        }

        const fetchResults = () => {
            fetch(`/api/quiz/results?studentId=${studentId}&date=${date}`)
                .then(res => res.json())
                .then(data => {
                    if (data.available) {
                        setResultData(data);
                    } else if (data.timing) {
                        setCountdown(data.timing);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching results:', err);
                    setLoading(false);
                });
        };

        fetchResults();
    }, [studentId, date, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!resultData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Results Declared at 8:30 PM</h1>
                {countdown && (
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-xl font-bold">{countdown.hours}h {countdown.minutes}m {countdown.seconds}s remaining</p>
                    </div>
                )}
                <Link href="/student/dashboard" className="mt-6 text-blue-600 underline">Back to Dashboard</Link>
            </div>
        );
    }

    const { result, voucher } = resultData;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-8">
                <h1 className="text-3xl font-black text-center mb-8">Quiz Result 🏆</h1>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-100 p-6 rounded-2xl text-center">
                        <p className="text-sm font-bold text-slate-500 uppercase">Rank</p>
                        <p className="text-4xl font-black">#{result.rank || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-100 p-6 rounded-2xl text-center">
                        <p className="text-sm font-bold text-slate-500 uppercase">Score</p>
                        <p className="text-4xl font-black">{result.score}/{result.totalQuestions}</p>
                    </div>
                </div>

                {voucher && (
                    <div className="bg-orange-50 border-2 border-dashed border-orange-200 p-6 rounded-2xl text-center mb-8">
                        <p className="text-lg font-bold text-orange-800">🎉 You won a {voucher.discountPercentage}% Discount!</p>
                        <p className="text-2xl font-black text-orange-600 my-2">{voucher.code}</p>
                        <Link href="/student/gifts" className="inline-block bg-orange-600 text-white px-6 py-2 rounded-xl font-bold mt-2">Redeem Now</Link>
                    </div>
                )}

                <button onClick={() => router.push('/student/dashboard')} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold">Back to Dashboard</button>
            </div>
        </div>
    );
}

export default function QuizResultsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QuizResultsContent />
        </Suspense>
    );
}
