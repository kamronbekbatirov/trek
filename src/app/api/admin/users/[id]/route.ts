import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore as never, sessionOptions);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { subscription: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(user);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const { orgType, taxRegime, plan, subStatus, name, role, onboardingDone } = body;

  const userUpdate: Record<string, unknown> = {};
  if (name !== undefined) userUpdate.name = name || null;
  if (role !== undefined) userUpdate.role = role;
  if (orgType !== undefined) userUpdate.orgType = orgType || null;
  if (taxRegime !== undefined) userUpdate.taxRegime = taxRegime || null;
  if (onboardingDone !== undefined) userUpdate.onboardingDone = onboardingDone;

  await prisma.user.update({ where: { id }, data: userUpdate });

  if (plan !== undefined || subStatus !== undefined) {
    const existing = await prisma.subscription.findUnique({ where: { userId: id } });
    if (existing) {
      const subUpdate: Record<string, unknown> = {};
      if (plan !== undefined) subUpdate.plan = plan;
      if (subStatus !== undefined) {
        subUpdate.status = subStatus;
        if (subStatus === "CANCELLED") subUpdate.cancelledAt = new Date();
      }
      await prisma.subscription.update({ where: { userId: id }, data: subUpdate });
    } else {
      await prisma.subscription.create({
        data: {
          userId: id,
          plan: plan || "FREE",
          status: subStatus || "ACTIVE",
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.userId) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
