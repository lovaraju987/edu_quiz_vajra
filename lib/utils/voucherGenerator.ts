/**
 * Utility functions for voucher generation and management
 */


/**
 * Generate a unique voucher code
 * Format: QUIZ2024-XXXXXX (where X is alphanumeric)
 * @returns Unique voucher code string
 */
export function generateVoucherCode(): string {
    const prefix = 'QUIZ2024';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString(36).substring(-4).toUpperCase();
    return `${prefix}-${random}${timestamp}`;
}

/**
 * Calculate voucher expiry date (30 days from generation)
 * @param generatedDate - Date when voucher was generated
 * @returns Expiry date (30 days later)
 */
export function calculateVoucherExpiry(generatedDate: Date = new Date()): Date {
    const expiryDate = new Date(generatedDate);
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days validity
    return expiryDate;
}

/**
 * Check if voucher is expired
 * @param expiryDate - Voucher expiry date
 * @returns true if voucher is expired
 */
export function isVoucherExpired(expiryDate: Date): boolean {
    return new Date() > new Date(expiryDate);
}

/**
 * Get voucher status based on redemption and expiry
 * @param isRedeemed - Whether voucher has been redeemed
 * @param expiryDate - Voucher expiry date
 * @returns 'redeemed' | 'expired' | 'active'
 */
export function getVoucherStatus(isRedeemed: boolean, expiryDate: Date): 'redeemed' | 'expired' | 'active' {
    if (isRedeemed) return 'redeemed';
    if (isVoucherExpired(expiryDate)) return 'expired';
    return 'active';
}

/**
 * Calculate discounted price
 * @param originalPrice - Original product price
 * @param discountPercent - Discount percentage (default 50)
 * @returns Discounted price
 */
export function calculateDiscountedPrice(originalPrice: number, discountPercent: number = 50): number {
    return originalPrice * (1 - discountPercent / 100);
}

/**
 * Format price in Indian Rupees
 * @param price - Price to format
 * @returns Formatted price string (e.g., "₹1,234")
 */
export function formatPrice(price: number): string {
    return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Alias for calculateVoucherExpiry with no parameters
 * @returns Expiry date (30 days from now)
 */
export function calculateExpiryDate(): Date {
    return calculateVoucherExpiry();
}
// Alias for backward compatibility if needed
export function getVoucherStatusLegacy(v: any): 'Redeemed' | 'Expired' | 'Active' {
    if (v.status === 'redeemed') return 'Redeemed';
    if (new Date(v.expiry) < new Date()) return 'Expired';
    return 'Active';
}
