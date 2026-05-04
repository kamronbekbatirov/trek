/**
 * Миграция: добавить недостающие события по водному налогу
 *
 * 1. ИП — годовой водный налог за 2025 год, срок 20 января 2026
 *    (ст.448 НК, срок для ИП — 20 января следующего года)
 *
 * 2. Дехканское хозяйство (FARM) — годовой водный налог за 2025 год,
 *    срок 1 мая 2026 (ст.448 ч.8 НК). 1 мая — праздник (Mehnat bayrami),
 *    перенос на 4 мая 2026 (понедельник).
 *
 * Run: npx tsx prisma/migrate-water-farm-ie.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── 1. ИП: водный налог за 2025 год — до 20 января 2026 ─────────────────
  const existingIeWater = await prisma.taxEvent.findFirst({
    where: {
      taxType: "WATER",
      year: 2026,
      month: 1,
      orgTypes: { equals: ["IE"] },
    },
  });

  if (!existingIeWater) {
    await prisma.taxEvent.create({
      data: {
        year: 2026,
        month: 1,
        date: new Date("2026-01-20"),
        taxType: "WATER",
        eventType: "BOTH",
        titleRu: "Водный налог за 2025 год (ИП) — отчётность и уплата",
        titleEn: "Water tax for 2025 (IE) — filing and payment",
        titleUz: "2025 yil uchun suv solig'i (YaTT) — hisobot va to'lov",
        titleUzc: "2025 йил учун сув солиғи (ЯТТ) — ҳисобот ва тўлов",
        descRu: "Индивидуальные предприниматели — плательщики водного налога представляют годовой расчёт и уплачивают водный налог за 2025 год. Срок для ИП — не позднее 20 января следующего года (ст.448 НК).",
        descEn: "Individual entrepreneurs who are water tax payers file the annual water tax return and pay water tax for 2025. Deadline for IE: no later than January 20 of the following year (Art. 448 of the Tax Code).",
        descUz: "Suv solig'i to'lovchi yakka tartibdagi tadbirkorlar 2025 yil uchun yillik suv solig'i hisobotini topshiradilar va to'lovni amalga oshiradilar. YaTT uchun muddat — keyingi yilning 20 yanvarigacha (NK 448-modda).",
        descUzc: "Сув солиғи тўловчи якка тартибдаги тадбиркорлар 2025 йил учун йиллик сув солиғи ҳисоботини топшириш ва тўловни амалга оширишади. ЯТТ учун муддат — кейинги йилнинг 20 январигача (НК 448-модда).",
        articleRef: "ст.448 НК",
        orgTypes: ["IE"],
        taxRegimes: [],
        requiresAssets: ["water"],
        requiresSpecial: [],
        requiresPension: [],
        isPublished: true,
        isDraft: false,
      },
    });
    console.log("✓ Создано: Водный налог за 2025 год (ИП) — 20 января 2026");
  } else {
    console.log("— Пропущено: событие уже существует (ИП, Jan 2026)");
  }

  // ─── 2. FARM: водный налог за 2025 год — до 1 мая 2026 ──────────────────
  // 1 мая 2026 — Mehnat bayrami (государственный праздник), перенос на 4 мая
  const existingFarmWater = await prisma.taxEvent.findFirst({
    where: {
      taxType: "WATER",
      year: 2026,
      month: 5,
      orgTypes: { equals: ["FARM"] },
    },
  });

  if (!existingFarmWater) {
    await prisma.taxEvent.create({
      data: {
        year: 2026,
        month: 5,
        date: new Date("2026-05-04"),
        originalDate: new Date("2026-05-01"),
        isPostponed: true,
        postponeReasonRu: "1 мая — праздник Mehnat bayrami, срок переносится на следующий рабочий день — 4 мая",
        postponeReasonEn: "May 1 is Mehnat bayrami (Labor Day), deadline moved to next working day — May 4",
        postponeReasonUz: "1 may — Mehnat bayrami, muddat keyingi ish kuniga ko'chiriladi — 4 may",
        postponeReasonUzc: "1 май — Меҳнат байрами, муддат кейинги иш кунига кўчирилади — 4 май",
        taxType: "WATER",
        eventType: "PAYMENT",
        titleRu: "Водный налог за 2025 год (дехканские хозяйства) — уплата",
        titleEn: "Water tax for 2025 (farm households) — payment",
        titleUz: "2025 yil uchun suv solig'i (dehqon xo'jaliklari) — to'lov",
        titleUzc: "2025 йил учун сув солиғи (деҳқон хўжаликлари) — тўлов",
        descRu: "Дехканские хозяйства уплачивают водный налог за 2025 год. Срок — не позднее 1 мая следующего года (ст.448 ч.8 НК). Срок перенесён с 1 мая (праздник) на 4 мая 2026.",
        descEn: "Farm households pay water tax for 2025. Deadline: no later than May 1 of the following year (Art. 448 para. 8 of the Tax Code). Deadline moved from May 1 (holiday) to May 4, 2026.",
        descUz: "Dehqon xo'jaliklari 2025 yil uchun suv solig'ini to'laydilar. Muddat — keyingi yilning 1 mayigacha (NK 448-modda 8-qism). Muddat 1 maydan (bayram) 4 mayga ko'chirildi.",
        descUzc: "Деҳқон хўжаликлари 2025 йил учун сув солиғини тўлайдилар. Муддат — кейинги йилнинг 1 майигача (НК 448-модда 8-қисм). Муддат 1 майдан (байрам) 4 майга кўчирилди.",
        articleRef: "ст.448 ч.8 НК",
        orgTypes: ["FARM"],
        taxRegimes: [],
        requiresAssets: [],
        requiresSpecial: [],
        requiresPension: [],
        isPublished: true,
        isDraft: false,
      },
    });
    console.log("✓ Создано: Водный налог за 2025 год (FARM) — 4 мая 2026");
  } else {
    console.log("— Пропущено: событие уже существует (FARM, May 2026)");
  }

  console.log("\nМиграция завершена.");
}

main()
  .catch((e) => {
    console.error("Ошибка миграции:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
