import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/features/auth/infrastructure/session";

const publicPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicPath = publicPaths.includes(path);

    const token = request.cookies.get("session")?.value;
    const session = token ? await decrypt(token) : null;

    // Redirect to login if accessing protected route without session
    if (!isPublicPath && !session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirect to home if accessing public route with session
    if (isPublicPath && session) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

