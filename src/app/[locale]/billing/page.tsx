import { setRequestLocale } from "next-intl/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { BillingView } from "@/components/billing/billing-view";

async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore as never, sessionOptions);
}

export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session.userId) {
    redirect({ href: "/auth/login", locale });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.userId },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  const subData = subscription
    ? {
        plan: subscription.plan as "FREE" | "PRO",
        status: subscription.status,
        nextBillingDate: subscription.nextBillingDate?.toISOString() ?? null,
        cancelledAt: subscription.cancelledAt?.toISOString() ?? null,
        cardMask: subscription.paymeCardMask,
        payments: subscription.payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          description: p.description,
          createdAt: p.createdAt.toISOString(),
        })),
      }
    : {
        plan: "FREE" as const,
        status: "ACTIVE",
        nextBillingDate: null,
        cancelledAt: null,
        cardMask: null,
        payments: [],
      };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container mx-auto px-4 max-w-3xl py-8">
        <BillingView subscription={subData} userId={session.userId!} locale={locale} />
      </main>
    </div>
  );
}
