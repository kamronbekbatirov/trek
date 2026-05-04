import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionOptions, SessionData } from "@/lib/session";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      success: true,
      role: user.role,
      onboardingDone: user.onboardingDone,
    });
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    session.userId = user.id;
    session.email = user.email;
    session.name = user.name ?? undefined;
    session.role = user.role;
    session.onboardingDone = user.onboardingDone;

    await session.save();

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
