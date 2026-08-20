import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken } from "./lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi =
    pathname.startsWith("/api/pesquisas") || pathname.startsWith("/api/candidatos");

  if (!isAdminRoute && !(isAdminApi && req.method !== "GET")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("admin_session")?.value;

  if (!isValidSessionToken(token)) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/pesquisas/:path*", "/api/candidatos/:path*"],
};
