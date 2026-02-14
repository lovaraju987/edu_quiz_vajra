import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Redirect authenticated users away from login pages
        console.log("Middleware - Raw Cookies:", req.cookies.getAll().map(c => c.name));

        if (token) {
            console.log("Middleware - Token found for path:", path, "Role:", token.role, "isDefaultPassword:", (token as any).isDefaultPassword);
        } else {
            console.log("Middleware - No token found for path:", path);
        }

        // 1. PUBLIC ROUTES (Login, API, etc.)
        if (path.startsWith("/quiz/login") || path.startsWith("/faculty/login")) {
            if (token) {
                // If already logged in, redirect to appropriate dashboard
                // @ts-ignore
                if (token.role === "student") {
                    // @ts-ignore
                    if (token.isDefaultPassword) {
                        console.log("Middleware - Login Page: Student has default password. Redirecting to update-password.");
                        return NextResponse.redirect(new URL("/student/update-password", req.url));
                    }
                    console.log("Middleware - Login Page: Student active. Redirecting to dashboard.");
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
                console.log("Middleware - Protected Route: Invalid token or role. Redirecting to login. Path:", path);
                return NextResponse.redirect(new URL("/quiz/login", req.url));
            }

            // FORCE PASSWORD UPDATE
            // @ts-ignore
            if (token.isDefaultPassword) {
                console.log("Middleware - Protected Route: Default password detected. Forcing redirect to update-password.");
                return NextResponse.redirect(new URL("/student/update-password", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                const path = req.nextUrl.pathname;
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
        "/faculty/login"
    ],
};
