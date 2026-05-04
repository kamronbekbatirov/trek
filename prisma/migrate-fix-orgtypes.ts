/**
 * Миграция: исправить orgTypes у 2025 и Jan/Feb 2026 событий.
 *
 * Проблема: события из seed.ts были созданы без явного orgTypes=[],
 * что означает "показывать всем". Это нарушает спецификацию:
 * - SELF_EMPLOYED не должен видеть НДС, имущество, акциз
 * - FARM не должен видеть НДС, налог с оборота, акциз, имущество
 *
 * Правила:
 * - VAT        → [LLC, JSC, IE]                (SELF_EMPLOYED/FARM не платят НДС)
 * - PROPERTY   → [LLC, JSC, IE]                (только юрлица и ИП)
 * - EXCISE     → [LLC, JSC, IE]                (SELF_EMPLOYED/FARM исключены ст.461)
 * - TURNOVER   → [LLC, JSC, IE, SELF_EMPLOYED] (FARM не платит НсО)
 * - SOCIAL     → [LLC, JSC, IE, FARM]          (FARM УСЛОВНО с сотрудниками; SELF_EMPLOYED не платит за сотрудников)
 * - INPS       → [LLC, JSC, IE, FARM]          (аналогично SOCIAL)
 *
 * Run: npx tsx prisma/migrate-fix-orgtypes.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const YEARS = [2025, 2026];
const MONTHS_2026 = [1, 2]; // only Jan/Feb for 2026 (Mar/Apr handled by seed scripts)

async function fixByTaxType(
  taxType: string,
  orgTypes: string[],
  extraWhere: Record<string, unknown> = {}
) {
  const result = await prisma.taxEvent.updateMany({
    where: {
      taxType,
      orgTypes: { equals: [] },
      OR: [
        { year: 2025 },
        { year: 2026, month: { in: MONTHS_2026 } },
      ],
      ...extraWhere,
    },
    data: { orgTypes },
  });
  return result.count;
}

async function main() {
  // VAT: только LLC/JSC/IE
  const vat = await fixByTaxType("VAT", ["LLC", "JSC", "IE"]);
  console.log(`✓ VAT: исправлено ${vat} событий → [LLC, JSC, IE]`);

  // PROPERTY: только LLC/JSC/IE
  const prop = await fixByTaxType("PROPERTY", ["LLC", "JSC", "IE"]);
  console.log(`✓ PROPERTY: исправлено ${prop} событий → [LLC, JSC, IE]`);

  // EXCISE: только LLC/JSC/IE
  const exc = await fixByTaxType("EXCISE", ["LLC", "JSC", "IE"]);
  console.log(`✓ EXCISE: исправлено ${exc} событий → [LLC, JSC, IE]`);

  // TURNOVER: LLC/JSC/IE/SELF_EMPLOYED (не FARM)
  const turnover = await fixByTaxType("TURNOVER", ["LLC", "JSC", "IE", "SELF_EMPLOYED"]);
  console.log(`✓ TURNOVER: исправлено ${turnover} событий → [LLC, JSC, IE, SELF_EMPLOYED]`);

  // SOCIAL (employer): LLC/JSC/IE/FARM (SELF_EMPLOYED не работодатель)
  // Исключаем IE-only personal social events (они уже имеют orgTypes=["IE"])
  const social = await prisma.taxEvent.updateMany({
    where: {
      taxType: "SOCIAL",
      orgTypes: { equals: [] },
      OR: [
        { year: 2025 },
        { year: 2026, month: { in: MONTHS_2026 } },
      ],
    },
    data: { orgTypes: ["LLC", "JSC", "IE", "FARM"] },
  });
  console.log(`✓ SOCIAL: исправлено ${social.count} событий → [LLC, JSC, IE, FARM]`);

  // INPS: LLC/JSC/IE/FARM (аналогично SOCIAL)
  const inps = await fixByTaxType("INPS", ["LLC", "JSC", "IE", "FARM"]);
  console.log(`✓ INPS: исправлено ${inps} событий → [LLC, JSC, IE, FARM]`);

  // Проверка: сколько осталось с orgTypes=[]
  const remaining = await prisma.taxEvent.count({
    where: {
      orgTypes: { equals: [] },
      OR: [
        { year: 2025 },
        { year: 2026, month: { in: MONTHS_2026 } },
      ],
    },
  });
  console.log(`\n— Осталось с orgTypes=[]: ${remaining} (должно быть 0)`);

  console.log("\nМиграция завершена.");
}

main()
  .catch((e) => {
    console.error("Ошибка миграции:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
