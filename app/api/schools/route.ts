import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import School from "@/models/School";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");

        const query: any = {};
        if (category) {
            query.category = category;
        }

        const schools = await School.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: schools });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        const school = await School.create(body);
        return NextResponse.json({ success: true, data: school }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}
