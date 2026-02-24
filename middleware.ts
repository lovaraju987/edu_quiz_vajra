import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Only log in development — never spam production server logs
const isDev = process.env.NODE_ENV === 'development';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Redirect authenticated users away from login pages
        if (isDev) console.log("[MW] Raw Cookies:", req.cookies.getAll().map(c => c.name));

        if (token) {
            if (isDev) console.log("[MW] Token found:", path, "Role:", token.role, "isDefaultPassword:", (token as any).isDefaultPassword);
        } else {
            if (isDev) console.log("[MW] No token for path:", path);
        }

        // 1. PUBLIC ROUTES (Login, API, etc.)
        if (path.startsWith("/quiz/login") || path.startsWith("/faculty/login")) {
            if (token) {
                // If already logged in, redirect to appropriate dashboard
                // @ts-ignore
                if (token.role === "student") {
                    // @ts-ignore
                    if (token.isDefaultPassword) {
                        if (isDev) console.log("[MW] Student default password → redirecting to update-password.");
                        return NextResponse.redirect(new URL("/student/update-password", req.url));
                    }
                    if (isDev) console.log("[MW] Student active → redirecting to dashboard.");
                    return NextResponse.redirect(new URL("/student/dashboard", req.url));
                }
                if (token.role === "faculty") {
                    return NextResponse.redirect(new URL("/faculty/dashboard", req.url));
                }
            }
            // Allow access to login page if not logged in
            return NextResponse.next();
        }

        // 2. PASSWORD UPDATE PAGE (Specific Exception)
        if (path === "/student/update-password") {
            if (!token) return NextResponse.redirect(new URL("/quiz/login", req.url));
            console.log("Middleware - Allowing access to update-password page.");
            return NextResponse.next();
        }

        // 3. STUDENT PROTECTED ROUTES
        if (path.startsWith("/student") || path.startsWith("/quiz/levels") || path.startsWith("/quiz/attempt")) {
            if (!token || token.role !== "student") {
                if (isDev) console.log("[MW] Protected route: invalid token/role → login. Path:", path);
                return NextResponse.redirect(new URL("/quiz/login", req.url));
            }

            // FORCE PASSWORD UPDATE
            // @ts-ignore
            if (token.isDefaultPassword) {
                if (isDev) console.log("[MW] Default password → forcing update-password redirect.");
                return NextResponse.redirect(new URL("/student/update-password", req.url));
            }
        }

        // 4. ADMIN PROTECTED ROUTES - CUSTOM AUTH
        if (path.startsWith("/admin")) {
            if (path === "/admin/login") return NextResponse.next();

            const adminToken = req.cookies.get("admin_token");
            if (!adminToken) {
                if (isDev) console.log("[MW] Admin: no token → redirecting to login.");
                return NextResponse.redirect(new URL("/admin/login", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                const path = req.nextUrl.pathname;

                // Bypass NextAuth for Admin Routes (Handled manually above)
                if (path.startsWith("/admin")) return true;

                // Existing public routes check
                if (path.startsWith("/quiz/login") || path.startsWith("/faculty/login")) {
                    return true;
                }
                return !!token;
            },
        },
        pages: {
            signIn: "/quiz/login",
        },
    }
);

export const config = {
    matcher: [
        "/student/:path*",
        "/quiz/levels/:path*",
        "/quiz/attempt/:path*",
        "/quiz/login",
        "/faculty/login",
        "/admin/:path*"
    ],
};
