
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Gift from '@/models/Gift';

/**
 * PUT /api/admin/gifts/[id]
 * Update a gift
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const data = await req.json();

        // Ensure we map title -> productName if present (legacy support)
        if (data.title && !data.productName) {
            data.productName = data.title;
        }

        const updatedGift = await Gift.findByIdAndUpdate(id, data, { new: true });

        if (!updatedGift) {
            return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Gift updated successfully',
            gift: updatedGift
        });

    } catch (error: any) {
        console.error('Error updating gift:', error);
        return NextResponse.json({ error: 'Failed to update gift' }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/gifts/[id]
 * Delete a gift
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        const deletedGift = await Gift.findByIdAndDelete(id);

        if (!deletedGift) {
            return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Gift deleted successfully'
        });

    } catch (error: any) {
        console.error('Error deleting gift:', error);
        return NextResponse.json({ error: 'Failed to delete gift' }, { status: 500 });
    }
}
