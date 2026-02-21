import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Faculty from "@/models/Faculty";
import Teacher from "@/models/Teacher";

export async function GET() {
    try {
        await dbConnect();

        const [facultyList, teacherList] = await Promise.all([
            Faculty.find({}).sort({ createdAt: -1 }),
            Teacher.find({}).sort({ createdAt: -1 })
        ]);

        // Normalize data for unified display
        const normalizedFaculty = facultyList.map((f: any) => ({
            _id: f._id,
            name: f.name,
            email: f.email,
            schoolName: f.schoolName,
            phone: f.phone,
            isProfileActive: f.isProfileActive,
            createdAt: f.createdAt,
            role: 'school_admin', // Distinct tag
            uniqueId: f.uniqueId
        }));

        const normalizedTeachers = teacherList.map((t: any) => ({
            _id: t._id,
            name: t.name,
            email: t.email,
            schoolName: t.schoolName, // Teachers have this denormalized
            phone: t.phone,
            isProfileActive: t.isActive, // Map isActive to isProfileActive for consistency
            createdAt: t.createdAt,
            role: 'teacher',
            uniqueId: t.uniqueId,
            schoolId: t.schoolId // Reference to parent
        }));

        // Combine and sort by date
        const combined = [...normalizedFaculty, ...normalizedTeachers].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ faculty: combined });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const { id, isProfileActive, role } = await req.json();

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        let updatedUser;
        if (role === 'teacher') {
            updatedUser = await Teacher.findByIdAndUpdate(
                id,
                { isActive: isProfileActive },
                { new: true }
            );
        } else {
            updatedUser = await Faculty.findByIdAndUpdate(
                id,
                { isProfileActive },
                { new: true }
            );
        }

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
