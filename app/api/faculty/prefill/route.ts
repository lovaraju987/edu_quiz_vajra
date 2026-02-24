import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Faculty from '@/models/Faculty';
import AllowedEmail from '@/models/AllowedEmail';

// GET /api/faculty/prefill?facultyId=...
// Returns schoolName and address from the admin-approved AllowedEmail record
export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const facultyId = searchParams.get('facultyId');

        if (!facultyId) {
            return NextResponse.json({ error: 'facultyId required' }, { status: 400 });
        }

        // Get the faculty's email
        const faculty = await Faculty.findById(facultyId).select('email');
        if (!faculty) {
            return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
        }

        // Look up the AllowedEmail record added by admin
        const allowed = await AllowedEmail.findOne({ email: faculty.email });
        if (!allowed) {
            return NextResponse.json({ schoolName: '', address: '' });
        }

        return NextResponse.json({
            schoolName: allowed.schoolName || '',
            address: allowed.address || '',
        });

    } catch (error: any) {
        console.error('[faculty/prefill]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
