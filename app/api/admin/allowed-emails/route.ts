
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AllowedEmail from '@/models/AllowedEmail';
import { sendInvitationEmail } from '@/lib/email';

export async function GET() {
    try {
        await dbConnect();

        // AUTH CHECK
        const { verifyAdmin } = await import("@/lib/admin-auth");
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
        }

        const emails = await AllowedEmail.find().sort({ addedAt: -1 });
        return NextResponse.json(emails);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();

        // AUTH CHECK
        const { verifyAdmin } = await import("@/lib/admin-auth");
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
        }

        const body = await req.json();
        const { email, schoolName, address } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if exists
        const exists = await AllowedEmail.findOne({ email: email.toLowerCase() });
        if (exists) {
            return NextResponse.json({ error: 'This email is already in the allowed list.' }, { status: 400 });
        }

        const newEntry = await AllowedEmail.create({
            email: email.toLowerCase(),
            schoolName,
            address,
            addedBy: admin.id || 'admin'
        });

        // ✅ Auto-send invitation email to the school after admin approves
        try {
            await sendInvitationEmail(email.toLowerCase(), schoolName || 'School');
        } catch (emailError) {
            // Don't fail the whole request if email fails — just log it
            console.error('[allowed-emails] Invitation email failed:', emailError);
        }

        return NextResponse.json(newEntry, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();

        // AUTH CHECK
        const { verifyAdmin } = await import("@/lib/admin-auth");
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await AllowedEmail.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
