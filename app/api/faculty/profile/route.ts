import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const facultyId = searchParams.get('facultyId');

        if (!facultyId) {
            return NextResponse.json({ error: 'Faculty ID required' }, { status: 400 });
        }

        const faculty = await Faculty.findById(facultyId).select('-password');
        if (!faculty) {
            return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
        }

        return NextResponse.json(faculty);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { facultyId, schoolName, schoolBoard, uniqueId } = body;

        if (!facultyId || !schoolName || !uniqueId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if uniqueId is taken by another faculty
        const existing = await Faculty.findOne({ uniqueId: uniqueId.toUpperCase(), _id: { $ne: facultyId } });
        if (existing) {
            return NextResponse.json({ error: 'This Unique ID is already taken by another school.' }, { status: 400 });
        }

        const faculty = await Faculty.findByIdAndUpdate(
            facultyId,
            {
                schoolName,
                schoolBoard,
                uniqueId: uniqueId.toUpperCase(),
                isProfileActive: true
            },
            { new: true }
        ).select('-password');

        return NextResponse.json({ message: 'Profile activated successfully', faculty });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
