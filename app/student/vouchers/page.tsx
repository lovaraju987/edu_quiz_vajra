"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function StudentVouchers() {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const session = localStorage.getItem('studentSession');
        if (!session) return;
        const { idNo } = JSON.parse(session);

        fetch(`/api/vouchers?studentId=${idNo}`)
            .then(res => res.json())
            .then(data => {
                setVouchers(data.vouchers || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-4xl">⏳</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <h1 className="text-3xl font-black mb-8">My Vouchers 🎁</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vouchers.map(v => (
                    <div key={v._id} className="bg-white p-6 rounded-3xl shadow-sm border-2 border-dashed border-blue-200 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{v.status}</p>
                            <p className="text-2xl font-black text-blue-600">{v.code}</p>
                            <p className="text-slate-600 font-medium">{v.discountPercentage}% OFF</p>
                        </div>
                        <Link href="/student/gifts" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Use Now</Link>
                    </div>
                ))}
            </div>
            <Link href="/student/dashboard" className="block mt-12 text-blue-600 underline text-center font-bold">Back to Dashboard</Link>
        </div>
    );
}
