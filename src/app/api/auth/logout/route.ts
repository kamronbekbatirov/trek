import { NextRequest, NextResponse } from "next/server";
import { sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ success: true });
  const session = await getIronSession(req, res, sessionOptions);
  session.destroy();
  return res;
}

// GET — clears the session and redirects to login (used to recover from stale sessions)
export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") ?? "ru";
  const redirectUrl = new URL(`/${locale}/auth/login`, req.url);
  const res = NextResponse.redirect(redirectUrl);
  const session = await getIronSession(req, res, sessionOptions);
  session.destroy();
  return res;
}
