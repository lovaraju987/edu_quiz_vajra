import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const idNo = searchParams.get('idNo');

        if (!idNo) {
            return NextResponse.json({ error: 'Please provide ?idNo=YOUR_ID' }, { status: 400 });
        }

        // Use raw collection to bypass any model schema issues
        const student = await Student.findOne({ idNo: idNo.toUpperCase() }).lean();

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // Force update using raw collection
        await Student.collection.updateOne(
            { _id: student._id },
            {
                $set: {
                    isFirstLogin: true,
                    // Ensure displayPassword exists if it was stripped? 
                    // We can't recover it if it's gone, but if it exists we keep it.
                }
            }
        );

        const updated = await Student.findOne({ idNo: idNo.toUpperCase() }).lean();

        return NextResponse.json({
            message: 'Student record repaired. Try logging in now.',
            before: student,
            after: updated
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
