
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils/voucherGenerator';

export default function VouchersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [redeeming, setRedeeming] = useState(false);
    const [message, setMessage] = useState('');

    const studentId = typeof window !== 'undefined' ? localStorage.getItem('student_id') : null;

    useEffect(() => {
        if (!studentId) {
            router.push('/');
            return;
        }

        fetchVouchers();
        fetchProducts();
    }, [studentId]);

    const fetchVouchers = async () => {
        try {
            const response = await fetch(`/api/vouchers?studentId=${studentId}`);
            const data = await response.json();
            setVouchers(data.vouchers || []);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleRedeemVoucher = async () => {
        if (!selectedVoucher || !selectedProduct) {
            setMessage('Please select a voucher and product');
            return;
        }

        setRedeeming(true);
        setMessage('');

        try {
            const response = await fetch('/api/vouchers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    voucherCode: selectedVoucher.voucherCode,
                    productId: selectedProduct._id
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`✅ ${data.message}`);
                fetchVouchers(); // Refresh vouchers
                setSelectedVoucher(null);
                setSelectedProduct(null);
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (error: any) {
            setMessage(`❌ ${error.message || 'Failed to redeem voucher'}`);
        } finally {
            setRedeeming(false);
        }
    };

    const activeVouchers = vouchers.filter(v => v.status === 'active');
    const redeemedVouchers = vouchers.filter(v => v.status === 'redeemed');
    const expiredVouchers = vouchers.filter(v => v.status === 'expired');

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading vouchers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/student/dashboard">
                        <button className="mb-4 px-4 py-2 bg-white text-slate-600 font-bold rounded-lg hover:bg-slate-100 transition-all">
                            ← Back to Dashboard
                        </button>
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
                        🎁 My Vouchers
                    </h1>
                    <p className="text-slate-600">
                        Manage and redeem your earned vouchers
                    </p>
                </div>

                {/* Voucher Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-green-500 text-white rounded-xl p-6">
                        <p className="text-sm font-bold uppercase mb-1">Active</p>
                        <p className="text-4xl font-black">{activeVouchers.length}</p>
                    </div>
                    <div className="bg-blue-500 text-white rounded-xl p-6">
                        <p className="text-sm font-bold uppercase mb-1">Redeemed</p>
                        <p className="text-4xl font-black">{redeemedVouchers.length}</p>
                    </div>
                    <div className="bg-slate-400 text-white rounded-xl p-6">
                        <p className="text-sm font-bold uppercase mb-1">Expired</p>
                        <p className="text-4xl font-black">{expiredVouchers.length}</p>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}

                {/* Active Vouchers */}
                {activeVouchers.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-4">Active Vouchers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeVouchers.map((voucher) => (
                                <div
                                    key={voucher._id}
                                    className={`bg-white rounded-xl p-6 border-2 cursor-pointer transition-all ${selectedVoucher?._id === voucher._id
                                        ? 'border-green-500 shadow-lg'
                                        : 'border-slate-200 hover:border-green-300'
                                        }`}
                                    onClick={() => setSelectedVoucher(voucher)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-bold text-green-600 uppercase">Voucher Code</p>
                                            <p className="text-xl font-black font-mono">{voucher.voucherCode}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-500 text-white text-sm font-black rounded-full">
                                            {voucher.discountPercent}% OFF
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-600 space-y-1">
                                        <p>📅 Expires: {new Date(voucher.expiryDate).toLocaleDateString()}</p>
                                        <p>🏆 Earned from Rank: #{voucher.rank}</p>
                                        <p>📆 Quiz Date: {new Date(voucher.quizDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Product Catalog */}
                {activeVouchers.length > 0 && products.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-4">Available Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {products.map((product) => {
                                const discountedPrice = selectedVoucher
                                    ? product.originalPrice * (1 - selectedVoucher.discountPercent / 100)
                                    : product.originalPrice;

                                return (
                                    <div
                                        key={product._id}
                                        className={`bg-white rounded-xl p-6 border-2 cursor-pointer transition-all ${selectedProduct?._id === product._id
                                            ? 'border-blue-500 shadow-lg'
                                            : 'border-slate-200 hover:border-blue-300'
                                            }`}
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        {product.imageUrl && (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.productName}
                                                className="w-full h-40 object-cover rounded-lg mb-4"
                                            />
                                        )}
                                        <h3 className="text-lg font-black text-slate-900 mb-2">
                                            {product.productName}
                                        </h3>
                                        <p className="text-sm text-slate-600 mb-3">{product.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-400 line-through">
                                                    {formatPrice(product.originalPrice)}
                                                </p>
                                                {selectedVoucher && (
                                                    <p className="text-xl font-black text-green-600">
                                                        {formatPrice(discountedPrice)}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Redeem Button */}
                        {selectedVoucher && selectedProduct && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={handleRedeemVoucher}
                                    disabled={redeeming}
                                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-lg rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50"
                                >
                                    {redeeming ? 'Redeeming...' : `Redeem ${selectedVoucher.voucherCode} for ${selectedProduct.productName}`}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* No Active Vouchers */}
                {activeVouchers.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <div className="text-6xl mb-4">🎯</div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">No Active Vouchers</h2>
                        <p className="text-slate-600 mb-6">
                            Rank between 101-10,000 in daily quizzes to earn vouchers!
                        </p>
                        <Link href="/">
                            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all">
                                Take Today's Quiz
                            </button>
                        </Link>
                    </div>
                )}

                {/* Redeemed Vouchers */}
                {redeemedVouchers.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-4">Redeemed Vouchers</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {redeemedVouchers.map((voucher) => (
                                <div key={voucher._id} className="bg-slate-100 rounded-xl p-6 border-2 border-slate-300">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-500 uppercase">Redeemed</p>
                                            <p className="text-xl font-black font-mono text-slate-700">{voucher.voucherCode}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-blue-500 text-white text-sm font-black rounded-full">
                                            USED
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-600 space-y-1">
                                        <p>✅ Redeemed: {new Date(voucher.redeemedAt).toLocaleDateString()}</p>
                                        <p>🏆 Rank: #{voucher.rank}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
