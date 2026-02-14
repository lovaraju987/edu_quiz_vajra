
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils/voucherGenerator';
import { validateName, validatePhone, validatePincode } from "@/lib/utils/validation";
import { toast } from "sonner";

interface CartItem {
    product: any;
    quantity: number;
}

export default function GiftsCatalogPage() {
    const router = useRouter();
    const [step, setStep] = useState<'enter_code' | 'browse_products' | 'checkout_address' | 'order_confirmation'>('enter_code');
    const [voucherCode, setVoucherCode] = useState('');
    const [validatingCode, setValidatingCode] = useState(false);
    const [codeError, setCodeError] = useState('');

    const [voucher, setVoucher] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [redeeming, setRedeeming] = useState(false);
    const [message, setMessage] = useState('');

    // Delivery Address State
    const [deliveryAddress, setDeliveryAddress] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
    });

    // Order Confirmation State
    const [orderDetails, setOrderDetails] = useState<any>(null);

    useEffect(() => {
        fetchProducts();

        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, selectedCategory, searchQuery]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    };

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    const addToCart = (product: any) => {
        const existingItem = cart.find(item => item.product._id === product._id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.product._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
        setMessage('✅ Added to cart!');
        setTimeout(() => setMessage(''), 2000);
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.product._id !== productId));
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(cart.map(item =>
            item.product._id === productId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const calculateCartTotal = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.product.originalPrice * item.quantity), 0);
        const discount = subtotal * (voucher.discountPercent / 100);
        const total = subtotal - discount;
        return { subtotal, discount, total };
    };

    const handleValidateVoucher = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidatingCode(true);
        setCodeError('');

        try {
            const response = await fetch(`/api/vouchers/validate?code=${voucherCode.trim()}`);
            const data = await response.json();

            if (response.ok && data.voucher) {
                setVoucher(data.voucher);
                setStep('browse_products');
            } else {
                setCodeError(data.error || 'Invalid voucher code. Please check and try again.');
            }
        } catch (error: any) {
            setCodeError('Failed to validate voucher code. Please try again.');
        } finally {
            setValidatingCode(false);
        }
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            setMessage('❌ Your cart is empty');
            return;
        }
        // Navigate to address form
        setShowCart(false);
        setStep('checkout_address');
    };

    const handlePlaceOrder = async () => {
        // Strict Validation
        if (!validateName(deliveryAddress.fullName)) {
            setMessage('❌ Full Name must be at least 3 characters');
            toast.error("Invalid Name");
            return;
        }

        if (!validatePhone(deliveryAddress.phone)) {
            setMessage('❌ Please enter a valid 10-digit phone number');
            toast.error("Invalid Phone Number");
            return;
        }

        if (!deliveryAddress.addressLine1.trim()) {
            setMessage('❌ Address Line 1 is required');
            toast.error("Address Required");
            return;
        }

        if (!deliveryAddress.city.trim()) {
            setMessage('❌ City is required');
            toast.error("City Required");
            return;
        }

        if (!deliveryAddress.state.trim()) {
            setMessage('❌ State is required');
            toast.error("State Required");
            return;
        }

        if (!validatePincode(deliveryAddress.pincode)) {
            setMessage('❌ Please enter a valid 6-digit pincode');
            toast.error("Invalid Pincode");
            return;
        }

        setRedeeming(true);
        setMessage('');

        try {
            // Calculate total amount
            const { total } = calculateCartTotal();

            // Create Razorpay order
            const orderResponse = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: total })
            });

            const orderData = await orderResponse.json();

            if (!orderResponse.ok) {
                throw new Error(orderData.error || 'Failed to create payment order');
            }

            // SUCCESS HANDLER (Shared between real and mock)
            const handleSuccess = async (response: any) => {
                try {
                    const verifyResponse = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            voucherCode: voucher.voucherCode,
                            productId: cart[0].product._id,
                            cartItems: cart.map(item => ({
                                productId: item.product._id,
                                quantity: item.quantity
                            })),
                            deliveryAddress: deliveryAddress
                        })
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyResponse.ok) {
                        const { total, subtotal, discount } = calculateCartTotal();
                        setOrderDetails({
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            orderDate: new Date(),
                            items: cart,
                            subtotal,
                            discount,
                            total,
                            deliveryAddress,
                            voucherCode: voucher.voucherCode,
                            discountPercent: voucher.discountPercent
                        });
                        setStep('order_confirmation');
                        setRedeeming(false);
                    } else {
                        setMessage(`❌ ${verifyData.error}`);
                        setRedeeming(false);
                    }
                } catch (error: any) {
                    setMessage(`❌ ${error.message || 'Payment verification failed'}`);
                    setRedeeming(false);
                }
            };

            // CHECK IF RAZORPAY SCRIPT LOADED
            // @ts-ignore
            if (typeof window.Razorpay === 'undefined') {
                console.warn('Razorpay SDK not loaded');

                // MOCK BYPASS in Development
                if (orderData.isMock) {
                    setMessage('⚠️ Payment gateway unreachable. Simulating mock payment for testing...');
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    await handleSuccess({
                        razorpay_order_id: orderData.orderId,
                        razorpay_payment_id: `pay_mock_${Date.now()}`,
                        razorpay_signature: 'mock_sig'
                    });
                    return;
                }
                throw new Error('Payment gateway (Razorpay) could not be loaded. Please check your internet connection.');
            }

            // Initialize REAL Razorpay payment
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'EduQuiz Store',
                description: `Order for ${cart.length} items`,
                order_id: orderData.orderId,
                prefill: {
                    name: deliveryAddress.fullName,
                    contact: deliveryAddress.phone,
                },
                theme: { color: '#2563eb' },
                handler: handleSuccess,
                modal: {
                    ondismiss: function () {
                        setMessage('❌ Payment cancelled');
                        setRedeeming(false);
                    }
                }
            };

            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error: any) {
            console.error('Payment Error:', error);
            setMessage(`❌ ${error.message || 'Failed to initiate payment'}`);
            setRedeeming(false);
        }
    };

    // Step 1: Enter Voucher Code - PREMIUM DESIGN
    if (step === 'enter_code') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 relative overflow-hidden flex flex-col">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                {/* Header */}
                <header className="relative z-10 backdrop-blur-sm bg-white/10 border-b border-white/20">
                    <div className="max-w-7xl mx-auto px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">EduQuiz Store</h1>
                                    <p className="text-xs text-white/80">Premium Rewards Marketplace</p>
                                </div>
                            </div>
                            <Link
                                href="/student/dashboard"
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all duration-300 text-sm font-medium border border-white/30"
                            >
                                ← Dashboard
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="relative z-10 w-full max-w-sm mx-auto px-4 flex-1 flex flex-col justify-center py-2">
                    {/* Glassmorphism Card */}
                    <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                        {/* Card Header with Gradient */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg transform hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-bold text-white mb-0.5">Redeem Voucher</h2>
                                <p className="text-white/90 text-[10px]">Enter code to unlock rewards</p>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="p-4">
                            <form onSubmit={handleValidateVoucher} className="space-y-3">
                                {/* Premium Input with Floating Label */}
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={voucherCode}
                                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                        placeholder=" "
                                        className="peer w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-mono text-center text-base tracking-wider focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                                        required
                                    />
                                    <label className="absolute left-6 top-2 text-gray-500 transition-all duration-300 pointer-events-none peer-focus:text-[10px] peer-focus:-top-2 peer-focus:left-4 peer-focus:bg-white peer-focus:px-2 peer-focus:text-blue-600 peer-focus:font-semibold peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2">
                                        Voucher Code
                                    </label>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {codeError && (
                                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-shake">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm font-medium">{codeError}</span>
                                    </div>
                                )}

                                {/* Premium CTA Button */}
                                <button
                                    type="submit"
                                    disabled={validatingCode || !voucherCode.trim()}
                                    className="group relative w-full px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 overflow-hidden text-sm"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {validatingCode ? (
                                            <>
                                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Validating...
                                            </>
                                        ) : (
                                            <>
                                                Continue to Store
                                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </>
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            </form>

                            {/* Test Codes Section */}
                            <div className="mt-3 p-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs font-bold text-gray-700">Test Voucher Codes</p>
                                </div>
                                <div className="space-y-1.5">
                                    {['QUIZ2024-TEST001', 'QUIZ2024-TEST002', 'QUIZ2024-TEST003'].map((code) => (
                                        <button
                                            key={code}
                                            onClick={() => setVoucherCode(code)}
                                            className="group w-full flex items-center justify-between px-2 py-1 bg-white hover:bg-blue-50 rounded border border-gray-200 hover:border-blue-400 transition-all duration-300 hover:shadow-sm"
                                        >
                                            <span className="font-mono text-xs text-gray-700 group-hover:text-blue-600 font-semibold">{code}</span>
                                            <svg className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="group cursor-pointer">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-700">Secure</p>
                                    </div>
                                    <div className="group cursor-pointer">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-700">Verified</p>
                                    </div>
                                    <div className="group cursor-pointer">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-700">Premium</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Custom Animations */}
                <style jsx>{`
                    @keyframes blob {
                        0%, 100% { transform: translate(0, 0) scale(1); }
                        33% { transform: translate(30px, -50px) scale(1.1); }
                        66% { transform: translate(-20px, 20px) scale(0.9); }
                    }
                    .animate-blob {
                        animation: blob 7s infinite;
                    }
                    .animation-delay-4000 {
                        animation-delay: 4s;
                    }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                    .animate-shake {
                        animation: shake 0.3s ease-in-out;
                    }
                `}</style>
            </div>
        );
    }

    // Step 2: Delivery Address Form - PREMIUM DESIGN
    if (step === 'checkout_address') {
        const { subtotal, discount, total } = calculateCartTotal();
        const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white shadow-sm sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
                                <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
                            </div>
                            <button
                                onClick={() => setStep('browse_products')}
                                className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Shopping
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fadeIn ${message.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {message.startsWith('✅') ? (
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                            <p className="font-medium">{message}</p>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Delivery Address Form */}
                        <div className="lg:col-span-2 space-y-5">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={deliveryAddress.fullName}
                                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, fullName: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            maxLength={10}
                                            value={deliveryAddress.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setDeliveryAddress({ ...deliveryAddress, phone: val });
                                            }}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                            placeholder="10-digit mobile number"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1</label>
                                        <input
                                            type="text"
                                            required
                                            value={deliveryAddress.addressLine1}
                                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, addressLine1: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                            placeholder="House No., Building Name"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2 (Optional)</label>
                                        <input
                                            type="text"
                                            value={deliveryAddress.addressLine2}
                                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, addressLine2: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                            placeholder="Road name, Area, Colony"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                        <input
                                            type="text"
                                            required
                                            value={deliveryAddress.city}
                                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                                        <input
                                            type="text"
                                            required
                                            value={deliveryAddress.state}
                                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                            placeholder="State"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={deliveryAddress.pincode}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                setDeliveryAddress({ ...deliveryAddress, pincode: val });
                                            }}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                            placeholder="6-digit PIN"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Landmark (Optional)</label>
                                        <input
                                            type="text"
                                            value={deliveryAddress.landmark}
                                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                            placeholder="Nearby landmark"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sticky top-24">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Order Summary
                                </h3>

                                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {cart.map((item) => (
                                        <div key={item.product._id} className="flex gap-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                                {item.product.imageUrl ? (
                                                    <img src={item.product.imageUrl} alt={item.product.productName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.productName}</p>
                                                <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                {formatPrice(item.product.originalPrice * item.quantity * (1 - voucher.discountPercent / 100))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-dashed border-gray-200 pt-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal ({cartItemCount} items)</span>
                                        <span className="font-medium">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount ({voucher.discountPercent}%)</span>
                                        <span className="font-medium">-{formatPrice(discount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Delivery</span>
                                        <span className="font-medium text-green-600">FREE</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-4 mt-2">
                                        <span>Total</span>
                                        <span className="text-blue-600">{formatPrice(total)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={redeeming}
                                    className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                >
                                    {redeeming ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Place Order
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </>
                                    )}
                                </button>

                                <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-green-800 uppercase tracking-wide">Voucher Applied</p>
                                        <p className="text-xs text-green-700 font-medium mt-0.5">{voucher.voucherCode} ({voucher.discountPercent}% OFF)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: Order Confirmation
    // Step 3: Order Confirmation - PREMIUM DESIGN
    if (step === 'order_confirmation' && orderDetails) {
        const estimatedDelivery = new Date(orderDetails.orderDate);
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row animate-scaleIn">
                    {/* Left Side - Success & Graphic */}
                    <div className="md:w-5/12 bg-gradient-to-br from-green-500 to-emerald-600 p-10 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 pattern-dots opacity-30"></div>

                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold mb-2 relative z-10">Order Confirmed!</h1>
                        <p className="text-green-100 mb-8 relative z-10">Thank you for your purchase.</p>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 w-full max-w-xs relative z-10 border border-white/20">
                            <p className="text-xs text-green-100 uppercase tracking-widest font-semibold mb-1">Order ID</p>
                            <p className="text-xl font-mono font-bold tracking-wider">{orderDetails.orderId}</p>
                        </div>

                        <div className="mt-8 relative z-10">
                            <button
                                onClick={() => {
                                    setStep('enter_code');
                                    setVoucher(null);
                                    setVoucherCode('');
                                    setCart([]);
                                    setFilteredProducts([]);
                                }}
                                className="px-8 py-3 bg-white text-green-600 font-bold rounded-full hover:bg-green-50 hover:shadow-lg transition-all transform hover:-translate-y-1"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Details */}
                    <div className="md:w-7/12 p-8 md:p-10 bg-white">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                            <p className="text-sm text-gray-500">
                                {orderDetails.orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Delivery Info */}
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                                    <p className="text-sm text-gray-600 mt-1">{orderDetails.deliveryAddress.fullName}</p>
                                    <p className="text-sm text-gray-600">
                                        {orderDetails.deliveryAddress.addressLine1}, {orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.state} - {orderDetails.deliveryAddress.pincode}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1 font-medium">Phone: {orderDetails.deliveryAddress.phone}</p>
                                </div>
                            </div>

                            {/* Estimated Delivery */}
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Estimated Delivery</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Expected by <span className="font-bold text-gray-800">{estimatedDelivery.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Items Summary */}
                            <div className="bg-gray-50 rounded-xl p-6 mt-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Items Summary</h3>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {orderDetails.items.map((item: any) => (
                                        <div key={item.product._id} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{item.product.productName} <span className="text-gray-400">x{item.quantity}</span></span>
                                            <span className="font-medium text-gray-900">{formatPrice(item.product.originalPrice * item.quantity * (1 - orderDetails.discountPercent / 100))}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total Amount Paid</span>
                                    <span className="text-xl font-bold text-blue-600">{formatPrice(orderDetails.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const { subtotal, discount, total } = calculateCartTotal();
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Step 4: E-Commerce with Shopping Cart - PREMIUM DESIGN
    return (
        <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
            {/* Premium Top Navigation with Gradient */}
            <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white shadow-xl flex-shrink-0 z-50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-6 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="leading-tight">
                                    <h1 className="text-lg font-bold whitespace-nowrap">EduQuiz Store</h1>
                                    <p className="text-[10px] text-white/80">Premium Rewards</p>
                                </div>
                            </div>

                            <div className="hidden md:block flex-1 max-w-xl">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for products..."
                                        className="w-full px-5 py-2.5 pr-12 rounded-xl text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-lg"
                                    />
                                    <svg className="absolute right-4 top-3 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Premium Cart Button */}
                            <button
                                onClick={() => setShowCart(!showCart)}
                                className="relative bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 border border-white/30 hover:scale-105 shadow-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg animate-pulse">
                                        {cartItemCount}
                                    </span>
                                )}
                                <span className="hidden sm:inline font-semibold">Cart</span>
                            </button>

                            <button
                                onClick={() => {
                                    setStep('enter_code');
                                    setVoucher(null);
                                    setVoucherCode('');
                                    setCart([]);
                                }}
                                className="text-sm hover:underline whitespace-nowrap"
                            >
                                Change Code
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Voucher Banner */}
            <div className="bg-green-600 text-white py-1 flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-xs font-medium">
                        🎉 Voucher Applied: <span className="font-mono font-bold">{voucher.voucherCode}</span> - Get {voucher.discountPercent}% OFF!
                    </p>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} py-3`}>
                    <div className="max-w-7xl mx-auto px-4 text-center font-medium">
                        {message}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 flex-1 min-h-0 w-full mb-4">
                <div className="flex gap-4 h-full pt-4">
                    {/* Sidebar Filters - PREMIUM DESIGN */}
                    <aside className="w-56 flex-shrink-0 h-full flex flex-col min-h-0">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-col h-full overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                            <div className="flex-1 min-h-0 flex flex-col mb-4">
                                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2 flex-shrink-0">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    Categories
                                </h3>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between group ${selectedCategory === category
                                                ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            {category}
                                            {selectedCategory === category && (
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl relative overflow-hidden group flex-shrink-0">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 group-hover:scale-150 transition-transform duration-700"></div>
                                <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1">Your Savings</p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-3xl font-bold text-green-600">{voucher.discountPercent}%</p>
                                    <p className="text-sm font-medium text-green-600">OFF</p>
                                </div>
                                <p className="text-xs text-green-700 mt-2 font-medium">Applied on all products</p>
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid - PREMIUM DESIGN */}
                    <main className="flex-1 h-full flex flex-col min-h-0">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full overflow-hidden relative">
                            {/* Top Decorative Line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>

                            {/* Product Header - Fixed at Top of Card */}
                            <div className="p-4 flex items-center justify-between flex-shrink-0 border-b border-gray-50">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                                    </h2>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded-full">
                                        {filteredProducts.length} Items
                                    </span>
                                </div>

                                {/* Sort Dropdown (Visual Only) */}
                                <div className="relative">
                                    <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[10px] font-medium cursor-pointer transition-all hover:bg-gray-100">
                                        <option>Sort: Featured</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                        <option>Newest Arrivals</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Internal Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {filteredProducts.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center p-16 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
                                        <p className="text-gray-500">Try adjusting your search or category filter</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredProducts.map((product) => {
                                            const originalPrice = product.originalPrice;
                                            const discountedPrice = originalPrice * (1 - voucher.discountPercent / 100);
                                            const savings = originalPrice - discountedPrice;
                                            const inCart = cart.find(item => item.product._id === product._id);

                                            return (
                                                <div
                                                    key={product._id}
                                                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
                                                >
                                                    {/* Image Section */}
                                                    <div className="relative bg-gray-100 aspect-[4/3] overflow-hidden group-hover:bg-gray-50 transition-colors">
                                                        {product.imageUrl ? (
                                                            <img
                                                                src={product.imageUrl}
                                                                alt={product.productName}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}

                                                        {/* Badges */}
                                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                                                            {voucher.discountPercent}% OFF
                                                        </div>

                                                        {inCart && (
                                                            <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg flex items-center gap-1 animate-fadeIn">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                In Cart ({inCart.quantity})
                                                            </div>
                                                        )}

                                                        {/* Hover Overlay */}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                            <button
                                                                onClick={() => addToCart(product)}
                                                                className="px-6 py-2 bg-white text-gray-900 font-bold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-blue-50 shadow-xl"
                                                            >
                                                                {inCart ? 'Add More' : 'Add to Cart'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Content Section */}
                                                    <div className="p-3">
                                                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 text-sm group-hover:text-blue-600 transition-colors">
                                                            {product.productName}
                                                        </h3>
                                                        <p className="text-[10px] text-gray-500 mb-2 line-clamp-1">
                                                            {product.description}
                                                        </p>

                                                        <div className="flex items-center gap-1 mb-2">
                                                            <div className="flex">
                                                                {[1, 2, 3, 4, 5].map((i) => (
                                                                    <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                ))}
                                                            </div>
                                                            <span className="text-[10px] font-medium text-gray-400">(4.0)</span>
                                                        </div>

                                                        <div className="flex items-end justify-between">
                                                            <div>
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-lg font-bold text-gray-900">
                                                                        {formatPrice(discountedPrice)}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 line-through">
                                                                        {formatPrice(originalPrice)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-green-600 font-bold mt-0.5 bg-green-50 px-1.5 py-0.5 rounded-full inline-block border border-green-100 uppercase tracking-tighter">
                                                                    Save {formatPrice(savings)}
                                                                </p>
                                                            </div>

                                                            <button
                                                                onClick={() => addToCart(product)}
                                                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:shadow-lg"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Shopping Cart Sidebar - PREMIUM DESIGN */}
            {showCart && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowCart(false)}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
                        {/* Cart Header */}
                        {/* Cart Header - COMPACT PREMIUM */}
                        <div className="bg-white border-b border-gray-100 p-3.5 flex items-center justify-between shadow-sm relative overflow-hidden flex-shrink-0">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Your Cart</h2>
                                    <div className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full text-[8px] font-bold border border-indigo-100 uppercase tracking-widest">
                                        SECURE
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium">{cartItemCount} items ready</p>
                            </div>
                            <button onClick={() => setShowCart(false)} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all duration-300 border border-gray-100 group">
                                <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                                    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 border border-gray-200 shadow-inner">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Cart is empty</h3>
                                    <p className="text-xs text-gray-500 mb-8 max-w-[200px]">Add some products from the catalog to get started.</p>
                                    <button
                                        onClick={() => setShowCart(false)}
                                        className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-gray-200 active:scale-95"
                                    >
                                        Browse Products
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {cart.map((item) => {
                                        const discountedPrice = item.product.originalPrice * (1 - voucher.discountPercent / 100);
                                        return (
                                            <div key={item.product._id} className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 flex gap-3 group hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                                                <div className="w-14 h-14 bg-gray-50 rounded-lg flex-shrink-0 relative overflow-hidden">
                                                    {item.product.imageUrl ? (
                                                        <img src={item.product.imageUrl} alt={item.product.productName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 flex flex-col justify-between py-0">
                                                    <div>
                                                        <h3 className="font-bold text-[12px] text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.product.productName}</h3>
                                                        <div className="flex items-baseline gap-1.5 mt-0.5">
                                                            <span className="font-bold text-gray-900 text-sm">{formatPrice(discountedPrice)}</span>
                                                            <span className="text-[9px] text-gray-400 line-through font-medium">{formatPrice(item.product.originalPrice)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100">
                                                            <button
                                                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all active:scale-95"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-6 text-center font-bold text-gray-900 text-[10px]">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all active:scale-95"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <button
                                                            onClick={() => removeFromCart(item.product._id)}
                                                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                                                            title="Remove item"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>

                        {/* Cart Footer - COMPACT ELEVATED */}
                        {cart.length > 0 && (
                            <div className="bg-white border-t border-gray-100 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-20">
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                                        <span>Subtotal</span>
                                        <span className="text-gray-900">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1.5 rounded-lg border border-green-100">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M17.707 9.293l-5-5a1 1 0 00-1.414 0l-5 5A1 1 0 007 11h1v3a2 2 0 002 2h4a2 2 0 002-2v-3h1a1 1 0 00.707-1.707z" />
                                            </svg>
                                            Savings Applied
                                        </div>
                                        <span>-{formatPrice(discount)}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2 text-gray-900 border-t border-gray-50 mt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Amount to pay</span>
                                            <span className="text-xl font-extrabold tracking-tighter text-indigo-600">{formatPrice(total)}</span>
                                        </div>
                                        <div className="text-[9px] text-gray-400 font-medium text-right mb-0.5">
                                            Inc. Taxes
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={redeeming}
                                    className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 slant-glow"></div>
                                    {redeeming ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            Complete Order
                                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
