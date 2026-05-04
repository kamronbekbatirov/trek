/**
 * Миграция: добавить обязательный соцналог ИП «за себя» для всех месяцев
 * (2025 и Jan/Feb 2026), где уже есть работодательский SOCIAL-событие.
 *
 * Согласно ст.408 п.1 НК, ИП ВСЕГДА уплачивает соцналог за себя
 * ≥1 БРВ/мес — даже без наёмных работников.
 *
 * Run: npx tsx prisma/migrate-ie-social.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MONTHS_RU = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_UZ = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];
const MONTHS_UZC = [
  "январ", "феврал", "март", "апрел", "май", "июн",
  "июл", "август", "сентябр", "октябр", "ноябр", "декабр",
];

function getPrevPeriod(month: number, year: number) {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return {
    ru: `${MONTHS_RU[prevMonth - 1]} ${prevYear}`,
    en: `${MONTHS_EN[prevMonth - 1]} ${prevYear}`,
    uz: `${MONTHS_UZ[prevMonth - 1]} ${prevYear}`,
    uzc: `${MONTHS_UZC[prevMonth - 1]} ${prevYear}`,
  };
}

async function main() {
  // Найти все работодательские SOCIAL-события, которые НЕ являются IE-only
  // (т.е. те, которые созданы в seed.ts без явного orgTypes=[IE])
  const employerSocialEvents = await prisma.taxEvent.findMany({
    where: {
      taxType: "SOCIAL",
      requiresEmployees: true,
      // Exclude March 2026 and April 2026 — those are handled by seed scripts
      NOT: {
        year: 2026,
        month: { in: [3, 4] },
      },
    },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  console.log(`Found ${employerSocialEvents.length} employer SOCIAL events to process`);

  let created = 0;
  let skipped = 0;

  for (const event of employerSocialEvents) {
    // Skip if this is already an IE-only event
    const isIeOnly =
      event.orgTypes.length === 1 && event.orgTypes[0] === "IE";
    if (isIeOnly) {
      skipped++;
      continue;
    }

    // Check if companion IE-only event already exists for this month/year
    const existing = await prisma.taxEvent.findFirst({
      where: {
        taxType: "SOCIAL",
        year: event.year,
        month: event.month,
        orgTypes: { equals: ["IE"] },
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    const period = getPrevPeriod(event.month, event.year);

    await prisma.taxEvent.create({
      data: {
        year: event.year,
        month: event.month,
        date: event.date,
        taxType: "SOCIAL",
        eventType: "PAYMENT",
        titleRu: `Уплата соцналога ИП за себя за ${period.ru} (≥1 БРВ/мес)`,
        titleEn: `IE mandatory personal social tax for ${period.en} (≥1 BRV/month)`,
        titleUz: `YaTT uchun shaxsiy ijtimoiy soliq to'lovi — ${period.uz} (≥1 BHM/oy)`,
        titleUzc: `ЯТТ учун шахсий ижтимоий солиқ тўлови — ${period.uzc} (≥1 БҲМ/ой)`,
        descRu: `Индивидуальные предприниматели уплачивают обязательный социальный налог за себя — не менее 1 БРВ в месяц (ст.408 п.1 НК). Обязательство действует независимо от наличия наёмных работников.`,
        descEn: `Individual entrepreneurs pay mandatory personal social tax of at least 1 BRV per month (Art. 408 para. 1 of the Tax Code). This obligation applies regardless of whether they have employees.`,
        descUz: `Yakka tartibdagi tadbirkorlar (YaTT) o'zlari uchun oyiga kamida 1 BHM miqdorida ijtimoiy soliq to'lashlari shart (NK 408-modda 1-band). Bu majburiyat xodimlari bormi yo yo'qmi — farq qilmaydi.`,
        descUzc: `Якка тартибдаги тадбиркорлар (ЯТТ) ўзлари учун ойига камида 1 БҲМ миқдорида ижтимоий солиқ тўлашлари шарт (НК 408-модда 1-банд). Бу мажбурият ходимлари борми йўқми — фарқ қилмайди.`,
        articleRef: "ст.408 п.1 НК",
        orgTypes: ["IE"],
        taxRegimes: [],
        requiresEmployees: null,
        requiresAssets: [],
        requiresSpecial: [],
        requiresPension: [],
        isPublished: true,
        isDraft: false,
      },
    });

    created++;
    console.log(
      `  ✓ Created IE personal social tax for ${event.year}-${String(event.month).padStart(2, "0")} (date: ${event.date.toISOString().slice(0, 10)})`
    );
  }

  console.log(`\nИтого: создано ${created}, пропущено ${skipped} событий`);
}

main()
  .catch((e) => {
    console.error("Ошибка миграции:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
