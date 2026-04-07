import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPrefixes = ["/user", "/admin"];
const authRoutes = ["/sign-in", "/sign-up"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = getSessionCookie(request);

    // Redirect unauthenticated users away from protected routes
    const isProtectedRoute = protectedPrefixes.some((prefix) =>
        pathname.startsWith(prefix)
    );
    if (isProtectedRoute && !sessionCookie) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Redirect authenticated users away from auth pages
    const isAuthRoute = authRoutes.some((route) =>
        pathname.startsWith(route)
    );
    if (isAuthRoute && sessionCookie) {
        return NextResponse.redirect(
            new URL("/user/bookmarker", request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/user/:path*", "/admin/:path*", "/sign-in", "/sign-up"],
};