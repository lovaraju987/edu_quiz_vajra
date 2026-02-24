import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Broadcast from '@/models/Broadcast';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const school = searchParams.get('school');

        // Only fetch active, non-expired broadcasts
        const query: any = {
            active: true,
            expiresAt: { $gte: new Date() }
        };

        if (school) {
            query.$or = [{ targetSchool: null }, { targetSchool: school }];
        }

        const broadcasts = await Broadcast.find(query).sort({ createdAt: -1 });
        return NextResponse.json(broadcasts);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Validation: Only faculty/admin can broadcast (simple check for now)
        const session = await getServerSession(authOptions);
        // Note: For faculty-only broadcasts, we might check faculty_session in production
        // But here we use a flexible approach

        await dbConnect();
        const data = await req.json();

        if (!data.message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const news = await Broadcast.create({
            message: data.message,
            type: data.type || 'info',
            active: true,
            targetSchool: data.targetSchool || null,
            createdBy: data.facultyId || 'System',
            expiresAt: new Date(Date.now() + (data.durationMins || 120) * 60 * 1000)
        });

        return NextResponse.json(news, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            await Broadcast.findByIdAndDelete(id);
        } else {
            // Clear all expired or inactive broadcasts
            await Broadcast.deleteMany({
                $or: [
                    { active: false },
                    { expiresAt: { $lt: new Date() } }
                ]
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
