import { NextRequest, NextResponse } from "next/server";
import { getSubdomainFromHost } from "@/src/utils/domain";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN;

export function proxy(request: NextRequest) {
  const hostname = request.nextUrl.hostname;

  if (!hostname) {
    return NextResponse.next();
  }

  if (!ROOT_DOMAIN) {
    throw new Error(
      "ROOT_DOMAIN must be configured to enable user subdomains.",
    );
  }

  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session")?.value;
  const subdomain = getSubdomainFromHost(hostname, ROOT_DOMAIN);

  if (subdomain) {
    if (session) {
      return NextResponse.next();
    }

    const url = new URL(request.url);
    url.pathname = "/auth";
    url.search = "";
    url.hash = "";
    return NextResponse.redirect(url);
  }

  const isProtectedRoute =
    pathname === "/" ||
    pathname === "/posts" ||
    pathname.startsWith("/posts/") ||
    pathname === "/users" ||
    pathname.startsWith("/users/");

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/|.*\\..*).*)"],
};
