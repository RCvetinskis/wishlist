import { NextRequest, NextResponse } from "next/server";

const AUTH_PATH = "/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session")?.value;

  if (pathname === AUTH_PATH && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isProtectedRoute =
    pathname === "/" || pathname === "/posts" || pathname.startsWith("/posts/");

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL(AUTH_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth", "/posts/:path*"],
};
