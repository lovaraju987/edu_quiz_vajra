"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GiftsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data.products || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <h1 className="text-3xl font-black mb-8">Gift Catalog 🎁</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map(p => (
                    <div key={p._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="h-48 bg-slate-100 rounded-2xl mb-4 flex items-center justify-center text-4xl">🎁</div>
                        <h2 className="text-xl font-bold mb-2">{p.name}</h2>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{p.description}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-black text-blue-600">₹{p.price}</span>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">Buy Now</button>
                        </div>
                    </div>
                ))}
            </div>
            <Link href="/student/dashboard" className="block mt-12 text-blue-600 underline text-center font-bold">Back to Dashboard</Link>
        </div>
    );
}
