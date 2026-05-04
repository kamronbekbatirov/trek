import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "./lib/session";

const locales = ["ru", "en", "uz", "uzc"] as const;
const defaultLocale = "ru";

function getLocaleFromPath(pathname: string): string | null {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return null;
}

const protectedPaths = ["/dashboard", "/settings", "/billing"];
// /calendar and /events are public (no auth required) but show personalized content if logged in
const adminPaths = ["/admin"];
const authPaths = ["/auth/login", "/auth/register"];

function buildRedirectUrl(req: NextRequest, pathname: string): URL {
  // Use X-Forwarded-Host if present (set by reverse proxy), otherwise fall back to Host header
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = forwardedHost ?? req.headers.get("host") ?? "trek.uz";
  return new URL(`${forwardedProto}://${host}${pathname}`);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if path has a locale prefix
  const localeInPath = getLocaleFromPath(pathname);

  // If no locale, redirect to default locale
  if (!localeInPath) {
    return NextResponse.redirect(buildRedirectUrl(req, `/${defaultLocale}${pathname}`));
  }

  // Strip locale for route matching
  const pathWithoutLocale =
    pathname === `/${localeInPath}`
      ? "/"
      : pathname.slice(`/${localeInPath}`.length);

  const isProtected = protectedPaths.some((p) =>
    pathWithoutLocale.startsWith(p)
  );
  const isAdmin = adminPaths.some((p) => pathWithoutLocale.startsWith(p));
  const isAuthPath = authPaths.some((p) => pathWithoutLocale.startsWith(p));

  if (isProtected || isAdmin) {
    const res = NextResponse.next();
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    if (!session.userId) {
      return NextResponse.redirect(buildRedirectUrl(req, `/${localeInPath}/auth/login`));
    }

    if (isAdmin && session.role !== "ADMIN") {
      return NextResponse.redirect(buildRedirectUrl(req, `/${localeInPath}/dashboard`));
    }
  }

  if (isAuthPath) {
    const res = NextResponse.next();
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    if (session.userId) {
      return NextResponse.redirect(buildRedirectUrl(req, `/${localeInPath}/dashboard`));
    }
  }

  // Set locale header for next-intl to pick up
  const response = NextResponse.next();
  response.headers.set("x-next-intl-locale", localeInPath);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
