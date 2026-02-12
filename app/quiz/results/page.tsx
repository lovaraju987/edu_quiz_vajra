<<<<<<< HEAD
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatTimeRemaining } from '@/lib/utils/timeCheck';

export default function QuizResultsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const studentId = searchParams.get('studentId');

    const [loading, setLoading] = useState(true);
    const [resultsAvailable, setResultsAvailable] = useState(false);
    const [timeUntilRelease, setTimeUntilRelease] = useState(0);
    const [result, setResult] = useState<any>(null);
    const [voucher, setVoucher] = useState<any>(null);
    const [eligibility, setEligibility] = useState<any>(null);
    const [error, setError] = useState('');
=======
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
>>>>>>> devepment-v/screen-compatibility

    useEffect(() => {
        if (!studentId) {
            router.push('/');
            return;
        }

<<<<<<< HEAD
        fetchResults();

        // Auto-refresh every 10 seconds if results not available yet
        const interval = setInterval(() => {
            if (!resultsAvailable) {
                fetchResults();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [studentId]);

    // Countdown timer
    useEffect(() => {
        if (!resultsAvailable && timeUntilRelease > 0) {
            const timer = setInterval(() => {
                setTimeUntilRelease(prev => Math.max(0, prev - 1000));
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [resultsAvailable, timeUntilRelease]);

    const fetchResults = async () => {
        try {
            const response = await fetch(`/api/quiz/results?studentId=${studentId}`);
            const data = await response.json();

            if (data.available) {
                setResultsAvailable(true);
                setResult(data.result);
                setVoucher(data.voucher);
                setEligibility(data.eligibility);
            } else {
                setResultsAvailable(false);
                if (data.releaseTime) {
                    const releaseTime = new Date(data.releaseTime).getTime();
                    setTimeUntilRelease(Math.max(0, releaseTime - Date.now()));
                }
                setError(data.message || 'Results not available yet');
            }
        } catch (err: any) {
            console.error('Error fetching results:', err);
            setError('Failed to fetch results');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading results...</p>
                </div>
=======
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
>>>>>>> devepment-v/screen-compatibility
            </div>
        );
    }

<<<<<<< HEAD
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
                        Quiz Results
                    </h1>
                    <p className="text-slate-600">
                        {new Date().toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                {!resultsAvailable ? (
                    /* Results Pending */
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-b-4 border-orange-500">
                        <div className="text-6xl mb-4">⏰</div>
                        <h2 className="text-2xl font-black text-slate-900 mb-4">
                            Results Will Be Available Soon!
                        </h2>
                        <p className="text-slate-600 mb-6">
                            Results will be released at <span className="font-bold text-blue-600">8:30 PM</span>
                        </p>

                        {timeUntilRelease > 0 && (
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-6 mb-6">
                                <p className="text-sm font-medium mb-2">Time Remaining</p>
                                <p className="text-4xl font-black">
                                    {formatTimeRemaining(timeUntilRelease)}
                                </p>
                            </div>
                        )}

                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                💡 <strong>Tip:</strong> This page will automatically refresh when results are available.
                                You can also check back at 8:30 PM!
                            </p>
                        </div>

                        <Link href="/student/dashboard">
                            <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all">
                                ← Back to Dashboard
                            </button>
                        </Link>
                    </div>
                ) : (
                    /* Results Available */
                    <div className="space-y-6">
                        {/* Score Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 border-b-4 border-green-500">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">
                                    {result.percentage >= 80 ? '🎉' : result.percentage >= 60 ? '👍' : '📚'}
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2">
                                    Your Score
                                </h2>
                                <div className="text-6xl font-black text-blue-600 mb-2">
                                    {result.score}/{result.totalQuestions}
                                </div>
                                <div className="text-2xl font-bold text-slate-600">
                                    {result.percentage}%
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="bg-blue-50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Level</p>
                                    <p className="text-2xl font-black text-blue-700">{result.level}</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-purple-600 font-bold uppercase mb-1">Time Taken</p>
                                    <p className="text-2xl font-black text-purple-700">
                                        {Math.floor(result.timeTaken / 60)}:{(result.timeTaken % 60).toString().padStart(2, '0')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rank Card - Top 100 */}
                        {eligibility?.isTop100 && (
                            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl shadow-xl p-8 text-white border-b-4 border-yellow-600">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🏆</div>
                                    <h2 className="text-3xl font-black mb-2">
                                        Congratulations!
                                    </h2>
                                    <p className="text-xl font-bold mb-4">
                                        You ranked <span className="text-5xl font-black">#{result.rank}</span>
                                    </p>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                        <p className="text-sm font-medium">
                                            🎓 You're eligible for the <strong>₹1 Lakh Scholarship</strong>!
                                        </p>
                                        <p className="text-xs mt-2 opacity-90">
                                            Keep up the excellent work and maintain your performance!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Voucher Card - Rank 101-10,000 */}
                        {eligibility?.hasVoucher && voucher && (
                            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl shadow-xl p-8 text-white border-b-4 border-green-600">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🎁</div>
                                    <h2 className="text-3xl font-black mb-2">
                                        You've Earned a Voucher!
                                    </h2>
                                    <p className="text-lg font-bold mb-4">
                                        Rank: #{result.rank}
                                    </p>

                                    <div className="bg-white text-slate-900 rounded-xl p-6 mb-4">
                                        <p className="text-sm font-bold text-green-600 uppercase mb-2">Voucher Code</p>
                                        <p className="text-2xl font-black mb-4 font-mono tracking-wider">
                                            {voucher.voucherCode}
                                        </p>
                                        <div className="flex items-center justify-center gap-2 text-sm">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                                                {voucher.discountPercent}% OFF
                                            </span>
                                            <span className="text-slate-500">
                                                Valid until {new Date(voucher.expiryDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <Link href="/student/vouchers">
                                        <button className="px-8 py-3 bg-white text-green-600 font-black rounded-lg hover:bg-green-50 transition-all shadow-lg">
                                            Redeem Voucher →
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Participation Card - Below Top 10,000 */}
                        {result.rank && result.rank > 10000 && (
                            <div className="bg-white rounded-2xl shadow-xl p-8 border-b-4 border-blue-500">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">💪</div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                                        Keep Going!
                                    </h2>
                                    <p className="text-slate-600 mb-4">
                                        Your Rank: <strong>#{result.rank}</strong>
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Practice daily to improve your rank and earn rewards!
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-center">
                            <Link href="/student/dashboard">
                                <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all">
                                    ← Dashboard
                                </button>
                            </Link>
                            <Link href="/">
                                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all">
                                    Home
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
=======
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
>>>>>>> devepment-v/screen-compatibility
            </div>
        </div>
    );
}
<<<<<<< HEAD
=======

export default function QuizResultsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QuizResultsContent />
        </Suspense>
    );
}
>>>>>>> devepment-v/screen-compatibility
