import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");

export async function PATCH(req: Request) {
    try {
        await dbConnect();

        // 1. Verify Authentication
        const cookieStore = cookies();
        const token = (await cookieStore).get("admin_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let adminId: string;
        try {
            const { payload } = await jwtVerify(token, SECRET_KEY);
            adminId = payload.id as string;
        } catch (error) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }

        // 2. Parse Request
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
        }

        // 3. Find Admin
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return NextResponse.json({ error: "Admin not found" }, { status: 404 });
        }

        // 4. Verify Current Password
        const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        // 5. Hash New Password & Update
        const salt = await bcrypt.genSalt(10);
        admin.passwordHash = await bcrypt.hash(newPassword, salt);
        await admin.save();

        return NextResponse.json({ success: true, message: "Password updated successfully" });

    } catch (error: any) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
