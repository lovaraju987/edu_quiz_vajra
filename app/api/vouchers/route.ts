import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Voucher from '@/models/Voucher';
import Product from '@/models/Product';
import { getVoucherStatus } from '@/lib/utils/voucherGenerator';

/**
 * GET /api/vouchers
 * Get all vouchers for a student
 * Query params: studentId (required)
 */
export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID is required' },
                { status: 400 }
            );
        }

        const vouchers = await Voucher.find({ studentId })
            .populate('redeemedProduct')
            .sort({ generatedDate: -1 });

        // Update status for each voucher
        const vouchersWithStatus = vouchers.map((voucher: any) => {
            const status = getVoucherStatus(voucher.isRedeemed, voucher.expiryDate);
            return {
                ...voucher.toObject(),
                status
            };
        });

        return NextResponse.json({
            vouchers: vouchersWithStatus,
            count: vouchersWithStatus.length,
            activeCount: vouchersWithStatus.filter((v: any) => v.status === 'active').length,
            redeemedCount: vouchersWithStatus.filter((v: any) => v.status === 'redeemed').length,
            expiredCount: vouchersWithStatus.filter((v: any) => v.status === 'expired').length
        });

    } catch (error: any) {
        console.error('Error fetching vouchers:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch vouchers' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/vouchers
 * Redeem a voucher for a product
 * Body: { voucherCode, productId }
 */
export async function POST(req: Request) {
    try {
        await dbConnect();

        const { voucherCode, productId } = await req.json();

        if (!voucherCode || !productId) {
            return NextResponse.json(
                { error: 'Voucher code and product ID are required' },
                { status: 400 }
            );
        }

        // ✅ ATOMIC REDEMPTION — single DB operation, zero race condition
        // The filter { voucherCode, isRedeemed: false } ensures ONLY ONE request
        // can ever succeed, even if 1000 users hit this simultaneously.
        // MongoDB's document-level locking guarantees atomicity.
        const now = new Date();
        const voucher = await Voucher.findOneAndUpdate(
            {
                voucherCode,
                isRedeemed: false,                    // ← only matches unredeemed
                $or: [
                    { expiryDate: { $gt: now } },     // not expired
                    { expiryDate: { $exists: false } } // or no expiry set
                ]
            },
            {
                $set: {
                    isRedeemed: true,
                    redeemedAt: now,
                    redeemedProduct: productId,
                    status: 'redeemed'
                }
            },
            { new: true } // return updated doc
        );

        // If null → either doesn't exist, already redeemed, or expired
        if (!voucher) {
            // Check WHY it failed (for correct error message)
            const existing = await Voucher.findOne({ voucherCode }).lean();
            if (!existing) {
                return NextResponse.json({ error: 'Invalid voucher code' }, { status: 404 });
            }
            if ((existing as any).isRedeemed) {
                return NextResponse.json({ error: 'Voucher has already been redeemed' }, { status: 409 });
            }
            return NextResponse.json({ error: 'Voucher has expired' }, { status: 400 });
        }

        // Find product (read-only, no race condition here)
        const product = await Product.findById(productId).lean() as any;
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        if (!product.isActive) {
            return NextResponse.json({ error: 'Product is not available' }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Voucher redeemed successfully!',
            voucher: {
                voucherCode: voucher.voucherCode,
                discountPercent: voucher.discountPercent,
                redeemedAt: voucher.redeemedAt
            },
            product: {
                name: product.productName,
                originalPrice: product.originalPrice,
                discountedPrice: product.originalPrice * (1 - voucher.discountPercent / 100)
            }
        });

    } catch (error: any) {
        console.error('Error redeeming voucher:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to redeem voucher' },
            { status: 500 }
        );
    }
}
