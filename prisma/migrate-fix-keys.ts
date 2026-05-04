/**
 * Миграция данных:
 * 1. Исправление eventType у ККТ-событий (был BOTH из-за EventType.OTHER = undefined)
 * 2. Исправление ключей assets/specialActivities/pensionFund у пользователей
 *    (старые UPPERCASE → новые lowercase)
 *
 * Run: npx tsx prisma/migrate-fix-keys.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── 1. Исправить ККТ-события (eventType BOTH → REPORT) ─────────────────────
  // Эти события создавались с EventType.OTHER, который не существует в схеме,
  // поэтому Prisma использовала дефолт BOTH. Правильный тип — REPORT.
  const kktTitles = [
    "Исправление ошибок ККТ",
    "Correction of",
    "KKM xatolarini tuzatish",
  ];

  let kktFixed = 0;
  for (const title of kktTitles) {
    const result = await prisma.taxEvent.updateMany({
      where: {
        titleRu: { contains: "Исправление ошибок ККТ" },
        eventType: "BOTH",
      },
      data: { eventType: "REPORT" },
    });
    kktFixed += result.count;
    break; // один запрос достаточно
  }
  console.log(`✓ ККТ-события: исправлено ${kktFixed} записей (BOTH → REPORT)`);

  // ─── 2. Исправить ключи в профилях пользователей ────────────────────────────
  const users = await prisma.user.findMany({
    select: { id: true, assets: true, specialActivities: true, pensionFund: true },
  });

  const assetMap: Record<string, string> = {
    PROPERTY: "property",
    LAND_NON_AG: "land_non_agri",
    LAND_AG: "land_agri",
    WATER_USAGE: "water",
  };

  const specialMap: Record<string, string> = {
    NON_RESIDENT_INCOME: "non_resident_income",
    DIVIDENDS: "dividends",
    ALCOHOL_TOBACCO: "alcohol_tobacco",
    EXCISE: "excise",
    SUBSOIL: "subsoil",
    HIGH_REVENUE_20B: "high_revenue_20b",
    CFC: "cfc",
    CONTROLLED_TRANSACTIONS: "controlled_transactions",
    ONLINE_KKT: "online_kkt",
  };

  const pensionMap: Record<string, string> = {
    DISABLED_CHILD_EMPLOYEE: "disabled_child",
    LOSS_OF_BREADWINNER: "loss_of_breadwinner",
  };

  const normalize = (arr: string[], map: Record<string, string>) =>
    arr.map((v) => map[v] ?? v);

  let usersFixed = 0;
  for (const user of users) {
    const newAssets = normalize(user.assets, assetMap);
    const newSpecial = normalize(user.specialActivities, specialMap);
    const newPension = normalize(user.pensionFund, pensionMap);

    const changed =
      JSON.stringify(newAssets) !== JSON.stringify(user.assets) ||
      JSON.stringify(newSpecial) !== JSON.stringify(user.specialActivities) ||
      JSON.stringify(newPension) !== JSON.stringify(user.pensionFund);

    if (changed) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          assets: newAssets,
          specialActivities: newSpecial,
          pensionFund: newPension,
        },
      });
      usersFixed++;
    }
  }
  console.log(`✓ Пользователи: исправлено ${usersFixed} из ${users.length} профилей`);
  // ─── 3. Исправить 2025 события — добавить requiresEmployees и requiresAssets ──
  // SOCIAL/INPS события должны показываться только работодателям
  const socialFixed = await prisma.taxEvent.updateMany({
    where: {
      taxType: { in: ["SOCIAL", "INPS"] },
      requiresEmployees: null,
      year: 2025,
    },
    data: { requiresEmployees: true },
  });
  console.log(`✓ 2025 SOCIAL/INPS: добавлено requiresEmployees=true для ${socialFixed.count} событий`);

  // PROPERTY авансы 2025 — требуют наличия имущества на балансе
  const propFixed = await prisma.taxEvent.updateMany({
    where: {
      taxType: "PROPERTY",
      requiresAssets: { isEmpty: true },
      year: 2025,
    },
    data: { requiresAssets: ["property"] },
  });
  console.log(`✓ 2025 PROPERTY: добавлено requiresAssets=['property'] для ${propFixed.count} событий`);

  // Jan/Feb 2026 события из seed.ts — тоже нужна же фиксация
  const social2026Fixed = await prisma.taxEvent.updateMany({
    where: {
      taxType: { in: ["SOCIAL", "INPS"] },
      requiresEmployees: null,
      year: 2026,
      month: { in: [1, 2] },
    },
    data: { requiresEmployees: true },
  });
  console.log(`✓ Jan/Feb 2026 SOCIAL/INPS: добавлено requiresEmployees=true для ${social2026Fixed.count} событий`);

  console.log("\nМиграция завершена.");
}

main()
  .catch((e) => {
    console.error("Ошибка миграции:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
