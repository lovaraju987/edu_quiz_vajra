/**
 * Utility functions for voucher generation and management
 */

export const generateVoucherCode = (prefix: string = "EQ") => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = prefix + "-";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const calculateExpiryDate = (days: number = 30) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);
};

export const getVoucherStatus = (v: any) => {
    if (v.status === 'redeemed') return 'Redeemed';
    if (new Date(v.expiry) < new Date()) return 'Expired';
    return 'Active';
};
