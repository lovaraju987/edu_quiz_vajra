import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Voucher from '@/models/Voucher';
import Product from '@/models/Product';
<<<<<<< HEAD
import { getVoucherStatus } from '@/lib/utils/voucherGenerator';

/**
 * GET /api/vouchers
 * Get all vouchers for a student
 * Query params: studentId (required)
 */
export async function GET(req: Request) {
    try {
        await dbConnect();

=======
import { generateVoucherCode, calculateExpiryDate } from '@/lib/utils/voucherGenerator';

export async function GET(req: Request) {
    try {
        await dbConnect();
>>>>>>> devepment-v/screen-compatibility
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
<<<<<<< HEAD
            return NextResponse.json(
                { error: 'Student ID is required' },
                { status: 400 }
            );
        }

        const vouchers = await Voucher.find({ studentId })
            .populate('redeemedProduct')
            .sort({ generatedDate: -1 });

        // Update status for each voucher
        const vouchersWithStatus = vouchers.map(voucher => {
            const status = getVoucherStatus(voucher.isRedeemed, voucher.expiryDate);
            return {
                ...voucher.toObject(),
                status
            };
        });

        return NextResponse.json({
            vouchers: vouchersWithStatus,
            count: vouchersWithStatus.length,
            activeCount: vouchersWithStatus.filter(v => v.status === 'active').length,
            redeemedCount: vouchersWithStatus.filter(v => v.status === 'redeemed').length,
            expiredCount: vouchersWithStatus.filter(v => v.status === 'expired').length
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
 * POST /api/vouchers/redeem
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

        // Find voucher
        const voucher = await Voucher.findOne({ voucherCode });

        if (!voucher) {
            return NextResponse.json(
                { error: 'Invalid voucher code' },
                { status: 404 }
            );
        }

        // Check if already redeemed
        if (voucher.isRedeemed) {
            return NextResponse.json(
                { error: 'Voucher has already been redeemed' },
                { status: 400 }
            );
        }

        // Check if expired
        if (new Date() > new Date(voucher.expiryDate)) {
            // Update status to expired
            voucher.status = 'expired';
            await voucher.save();

            return NextResponse.json(
                { error: 'Voucher has expired' },
                { status: 400 }
            );
        }

        // Find product
        const product = await Product.findById(productId);

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        if (!product.isActive) {
            return NextResponse.json(
                { error: 'Product is not available' },
                { status: 400 }
            );
        }

        // Redeem voucher
        voucher.isRedeemed = true;
        voucher.redeemedAt = new Date();
        voucher.redeemedProduct = productId;
        voucher.status = 'redeemed';
        await voucher.save();

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
=======
            return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
        }

        const vouchers = await Voucher.find({
            studentId: studentId.toUpperCase()
        }).sort({ createdAt: -1 });

        return NextResponse.json({ vouchers });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { studentId, studentName, discountPercentage, type } = await req.json();

        const voucher = await Voucher.create({
            code: generateVoucherCode(),
            studentId: studentId.toUpperCase(),
            studentName,
            discountPercentage: discountPercentage || 10,
            expiry: calculateExpiryDate(30),
            status: 'active',
            type: type || 'quiz_reward'
        });

        return NextResponse.json(voucher, { status: 201 });
    } catch (error: any) {
        console.error('Voucher Creation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const { voucherId, productId, deliveryDetails } = await req.json();

        const voucher = await Voucher.findById(voucherId);
        if (!voucher) return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
        if (voucher.status !== 'active') return NextResponse.json({ error: 'Voucher not active' }, { status: 400 });

        const product = await Product.findById(productId);
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        voucher.status = 'redeemed';
        voucher.productId = productId;
        voucher.redeemedAt = new Date();
        voucher.deliveryDetails = deliveryDetails;
        await voucher.save();

        return NextResponse.json({ success: true, voucher });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
>>>>>>> devepment-v/screen-compatibility
    }
}
