import { getTranslations, setRequestLocale } from "next-intl/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore as never, sessionOptions);
}

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const session = await getSession();
  if (!session.userId || session.role !== "ADMIN") {
    redirect({ href: "/dashboard", locale });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  const users = await prisma.user.findMany({
    include: { subscription: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 max-w-5xl py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{t("users")}</h1>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Имя</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Тип орг.</th>
                  <th className="text-left px-4 py-3 font-semibold">Тариф</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Статус</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Роль</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Дата рег.</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${u.id}`} className="block hover:underline">
                        {u.email}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {u.name || "—"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {({
                        LLC: "ООО", JSC: "АО", IE: "ИП",
                        SELF_EMPLOYED: "Самозанятый", FARM: "Фермерское хоз-во",
                        ACCOUNTANT: "Бухгалтер/Аутсорсер",
                      } as Record<string, string>)[u.orgType ?? ""] ?? u.orgType ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.subscription?.plan === "PRO"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {u.subscription?.plan || "FREE"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.subscription?.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : u.subscription?.status === "PAST_DUE"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {u.subscription?.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.role === "ADMIN"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                Нет пользователей
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t text-sm text-muted-foreground">
            Всего: {users.length} пользователей
          </div>
        </div>
      </main>
    </div>
  );
}
