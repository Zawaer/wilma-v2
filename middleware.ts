import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const wilma2SID = request.cookies.get("Wilma2SID");
    const { pathname } = request.nextUrl;

    // TODO: check that the Wilma2SID is valid

    // public routes that dont require authentication
    const publicRoutes = ["/login", "/terms-of-service", "/privacy-policy"];
    const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
    );

    const url = request.nextUrl.clone();

    // if no session (no Wilma2SID) and trying to access protected route, redirect to login
    if (!wilma2SID && !isPublicRoute) {
        url.pathname = "/login";

        if (pathname !== "/" && pathname !== "/home") {
            // remove leading slash
            url.searchParams.set("returnpath", pathname.slice(1));
        }
        
        return NextResponse.redirect(url);
    }

    // If has session and trying to access login, redirect to home
    if (wilma2SID && pathname.startsWith("/login")) {
        url.pathname = "/home";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
    ],
};
