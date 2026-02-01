import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';

export async function GET(req: Request) {
    try {
        const isDbConnected = await dbConnect();
        const { searchParams } = new URL(req.url);
        const facultyId = searchParams.get('facultyId');

        // MOCK MODE FALLBACK
        if (isDbConnected === false) {
            return NextResponse.json({
                _id: facultyId || 'mock-id',
                name: 'Mock Faculty',
                email: 'mock@eduquiz.world',
                schoolName: 'Vajra International (MOCK)',
                schoolBoard: 'CBSE',
                uniqueId: 'EQ',
                isProfileActive: true
            });
        }

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
        const isDbConnected = await dbConnect();
        const body = await req.json();
        const { facultyId, schoolName, schoolBoard, uniqueId, designation, phone, address } = body;

        // MOCK MODE FALLBACK
        if (isDbConnected === false) {
            return NextResponse.json({
                message: 'Profile activated successfully (MOCK MODE)',
                faculty: { ...body, isProfileActive: true }
            });
        }

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
                designation,
                phone,
                address,
                isProfileActive: true
            },
            { new: true }
        ).select('-password');

        return NextResponse.json({ message: 'Profile activated successfully', faculty });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
