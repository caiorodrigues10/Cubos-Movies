import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE = process.env.COOKIE_NAME || "auth_token";

export function proxy(req: NextRequest) {
	const token = req.cookies.get(AUTH_COOKIE)?.value;
	const { pathname } = req.nextUrl;

	const isAuth = Boolean(token);
	const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
	const isProtected = pathname.startsWith("/movies");

	if (isAuthPage && isAuth) {
		const url = req.nextUrl.clone();
		url.pathname = "/movies";
		return NextResponse.redirect(url);
	}

	if (isProtected && !isAuth) {
		const url = req.nextUrl.clone();
		url.pathname = "/login";
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/login", "/register", "/movies/:path*"],
};

