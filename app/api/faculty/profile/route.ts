import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { getFacultyIdFromRequest } = await import('@/lib/auth');
        const facultyId = getFacultyIdFromRequest(req);

        if (!facultyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

        const { getFacultyIdFromRequest } = await import('@/lib/auth');
        const facultyId = getFacultyIdFromRequest(req);

        if (!facultyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { schoolName, schoolBoard, uniqueId } = body;

        if (!schoolName || !uniqueId) {
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

        if (!faculty) {
            return NextResponse.json({ error: 'Faculty profile not found or could not be updated.' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Profile activated successfully',
            faculty: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                schoolName: faculty.schoolName,
                schoolBoard: faculty.schoolBoard, // Added this
                uniqueId: faculty.uniqueId,
                isProfileActive: true
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
