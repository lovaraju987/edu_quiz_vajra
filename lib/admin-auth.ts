
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");

export async function verifyAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        if (payload.role !== "super_admin" && payload.role !== "admin") {
            return null;
        }
        return payload;
    } catch (error) {
        return null; // Invalid token
    }
}
