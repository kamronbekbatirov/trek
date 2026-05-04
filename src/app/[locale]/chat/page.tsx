import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { redirect as nextRedirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/db";
import { ProChat } from "@/components/chat/pro-chat";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI-чатбот | Trek" };

async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore as never, sessionOptions);
}

export default async function ChatPage({
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
    select: { email: true, name: true, role: true },
  });

  if (!user) {
    nextRedirect(`/api/auth/logout?locale=${locale}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container mx-auto px-4 max-w-3xl py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">AI-чатбот</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Задайте вопрос о налоговом законодательстве Узбекистана
          </p>
        </div>
        <ProChat />
      </main>
    </div>
  );
}
