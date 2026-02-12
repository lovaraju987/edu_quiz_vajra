import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Redirect authenticated users away from login pages
        if (path.startsWith("/quiz/login") || path.startsWith("/faculty/login")) {
            if (token) {
                if (token.role === "student") {
                    return NextResponse.redirect(new URL("/student/dashboard", req.url));
                } else if (token.role === "faculty") {
                    // Adjust based on faculty routes
                    return NextResponse.redirect(new URL("/faculty/dashboard", req.url));
                }
            }
        }

        // Protect student routes
        if (path.startsWith("/student") || path.startsWith("/quiz/levels") || path.startsWith("/quiz/attempt")) {
            if (!token || token.role !== "student") {
                return NextResponse.redirect(new URL("/quiz/login", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
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
