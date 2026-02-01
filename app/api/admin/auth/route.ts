import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");

export async function POST(req: Request) {
    try {
        console.log("🔍 Admin Login Attempt...");
        await dbConnect();

        const body = await req.json();
        const { username, password } = body;
        console.log("📝 Credentials received for:", username);

        if (!username || !password) {
            return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
        }

        // Find admin by username
        const admin = await Admin.findOne({ username });

        if (!admin) {
            console.log("⚠️ User not found. Checking if first admin...");
            // SECURITY: Verify if this is the FIRST admin ever. If so, create one.
            const adminCount = await Admin.countDocuments();
            if (adminCount === 0) {
                console.log("🆕 creating Super Admin...");
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);
                const newAdmin = await Admin.create({
                    username,
                    passwordHash: hash,
                    role: "super_admin"
                });

                console.log("✅ Super Admin Created:", newAdmin._id);

                // Proceed to login with this new admin
                const token = await new SignJWT({ id: newAdmin._id.toString(), role: newAdmin.role })
                    .setProtectedHeader({ alg: "HS256" })
                    .setIssuedAt()
                    .setExpirationTime("24h")
                    .sign(SECRET_KEY);

                const response = NextResponse.json({ success: true });
                response.cookies.set("admin_token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    path: "/",
                    maxAge: 60 * 60 * 24, // 1 day
                });
                return response;
            }

            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Verify Password
        console.log("🔐 Verifying password...");
        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) {
            console.log("❌ Invalid password");
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Generate Session Content
        console.log("✅ Password verified. Generating token...");
        const token = await new SignJWT({ id: admin._id.toString(), role: admin.role })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("24h")
            .sign(SECRET_KEY);

        // Return success with cookie
        const response = NextResponse.json({ success: true });
        response.cookies.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        return response;

    } catch (error: any) {
        console.error("❌ Admin Login Critical Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
