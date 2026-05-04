/**
 * Data migration: set requiresEmployees, requiresAssets, requiresSpecial, requiresPension
 * on existing TaxEvent records based on their taxType and title patterns.
 *
 * Run: npx tsx prisma/migrate-event-conditions.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. INPS events → requiresEmployees = true
  const inps = await prisma.taxEvent.updateMany({
    where: { taxType: "INPS" },
    data: { requiresEmployees: true },
  });
  console.log(`INPS → requiresEmployees=true: ${inps.count} events`);

  // 2. PERSONAL_IT events → requiresEmployees = true
  //    (НДФЛ as employer — all PERSONAL_IT in current DB is employer-side)
  const pit = await prisma.taxEvent.updateMany({
    where: { taxType: "PERSONAL_IT" },
    data: { requiresEmployees: true },
  });
  console.log(`PERSONAL_IT → requiresEmployees=true: ${pit.count} events`);

  // 3. SOCIAL events for LLC/JSC/IE (employer social tax) → requiresEmployees = true
  //    SOCIAL for SELF_EMPLOYED only = voluntary, leave as null
  const social = await prisma.taxEvent.updateMany({
    where: {
      taxType: "SOCIAL",
      orgTypes: { hasSome: ["LLC", "JSC", "IE"] },
    },
    data: { requiresEmployees: true },
  });
  console.log(`SOCIAL (employer) → requiresEmployees=true: ${social.count} events`);

  // 4. PROPERTY events → requiresAssets = ["property"]
  const property = await prisma.taxEvent.updateMany({
    where: { taxType: "PROPERTY" },
    data: { requiresAssets: ["property"] },
  });
  console.log(`PROPERTY → requiresAssets=["property"]: ${property.count} events`);

  // 5. LAND events → requiresAssets = ["land_non_agri"]
  //    (Agri land for FARM is different — they get it by notice, not these events)
  const land = await prisma.taxEvent.updateMany({
    where: { taxType: "LAND" },
    data: { requiresAssets: ["land_non_agri"] },
  });
  console.log(`LAND → requiresAssets=["land_non_agri"]: ${land.count} events`);

  // 6. WATER events → requiresAssets = ["water"]
  const water = await prisma.taxEvent.updateMany({
    where: { taxType: "WATER" },
    data: { requiresAssets: ["water"] },
  });
  console.log(`WATER → requiresAssets=["water"]: ${water.count} events`);

  // 7. EXCISE events → requiresSpecial = ["excise"]
  const excise = await prisma.taxEvent.updateMany({
    where: { taxType: "EXCISE" },
    data: { requiresSpecial: ["excise"] },
  });
  console.log(`EXCISE → requiresSpecial=["excise"]: ${excise.count} events`);

  // 8. RENT events → requiresSpecial = ["subsoil"]
  const rent = await prisma.taxEvent.updateMany({
    where: { taxType: "RENT" },
    data: { requiresSpecial: ["subsoil"] },
  });
  console.log(`RENT → requiresSpecial=["subsoil"]: ${rent.count} events`);

  // 9. Non-resident income events (by articleRef pattern ст.355)
  const nonResident = await prisma.taxEvent.updateMany({
    where: { articleRef: { contains: "355" } },
    data: { requiresSpecial: ["non_resident_income"] },
  });
  console.log(`ст.355 → requiresSpecial=["non_resident_income"]: ${nonResident.count} events`);

  // 10. Dividend/interest events (by articleRef pattern ст.345)
  const dividends = await prisma.taxEvent.updateMany({
    where: { articleRef: { contains: "345" } },
    data: { requiresSpecial: ["dividends"] },
  });
  console.log(`ст.345 → requiresSpecial=["dividends"]: ${dividends.count} events`);

  // 11. Pension fund events (requiresPension)
  //     ПФ ребёнок-инвалид (ПКМ №661 пп.45-46) → requiresPension = ["disabled_child"]
  const pfChild = await prisma.taxEvent.updateMany({
    where: { articleRef: { contains: "661" }, titleRu: { contains: "ребёнок" } },
    data: { requiresPension: ["disabled_child"], requiresEmployees: true },
  });
  console.log(`ПФ ребёнок-инвалид → requiresPension: ${pfChild.count} events`);

  //     Возмещение расходов ПФ (ПКМ №661 п.32) → requiresPension = ["loss_of_breadwinner"]
  const pfLoss = await prisma.taxEvent.updateMany({
    where: { articleRef: { contains: "661" }, titleRu: { contains: "Возмещение" } },
    data: { requiresPension: ["loss_of_breadwinner"], requiresEmployees: true },
  });
  console.log(`ПФ возмещение → requiresPension: ${pfLoss.count} events`);

  // 12. KKT correction events → requiresSpecial = ["online_kkt"]
  const kkt = await prisma.taxEvent.updateMany({
    where: { titleRu: { contains: "ККТ" } },
    data: { requiresSpecial: ["online_kkt"] },
  });
  console.log(`ККТ → requiresSpecial=["online_kkt"]: ${kkt.count} events`);

  // 13. Alcohol/tobacco fees → requiresSpecial = ["alcohol_tobacco"]
  const alcohol = await prisma.taxEvent.updateMany({
    where: {
      OR: [
        { titleRu: { contains: "алкоголь" } },
        { titleRu: { contains: "алкогол" } },
        { titleRu: { contains: "табак" } },
        { titleRu: { contains: "Сборы за реализацию" } },
      ],
    },
    data: { requiresSpecial: ["alcohol_tobacco"] },
  });
  console.log(`Алкоголь/табак → requiresSpecial=["alcohol_tobacco"]: ${alcohol.count} events`);

  // 14. Mining/subsoil events (Недра) → requiresSpecial = ["subsoil"]
  const subsoil = await prisma.taxEvent.updateMany({
    where: { taxType: "OTHER", titleRu: { contains: "недр" } },
    data: { requiresSpecial: ["subsoil"] },
  });
  console.log(`Недра (OTHER) → requiresSpecial=["subsoil"]: ${subsoil.count} events`);

  // 15. High revenue (>20 млрд) advance profit tax events
  const highRevenue = await prisma.taxEvent.updateMany({
    where: { titleRu: { contains: "20 млрд" } },
    data: { requiresSpecial: ["high_revenue_20b"] },
  });
  console.log(`>20 млрд → requiresSpecial=["high_revenue_20b"]: ${highRevenue.count} events`);

  // 16. CFC (КИК) events
  const cfc = await prisma.taxEvent.updateMany({
    where: { titleRu: { contains: "КИК" } },
    data: { requiresSpecial: ["cfc"] },
  });
  console.log(`КИК → requiresSpecial=["cfc"]: ${cfc.count} events`);

  // 17. Controlled transactions (контролируемые сделки)
  const ct = await prisma.taxEvent.updateMany({
    where: { titleRu: { contains: "контролируем" } },
    data: { requiresSpecial: ["controlled_transactions"] },
  });
  console.log(`Контролируемые сделки → requiresSpecial: ${ct.count} events`);

  console.log("\nMigration complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
