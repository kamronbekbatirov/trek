import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";
import { redirect } from "@/i18n/navigation";

export default async function OnboardingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore as never, sessionOptions);

  if (session.userId) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { onboardingDone: true },
    });
    if (user?.onboardingDone) {
      redirect({ href: "/dashboard", locale });
      return null;
    }
  }

  return <>{children}</>;
}
