/**
 * Seed script: April 2026 tax events for Uzbekistan
 * Source: TREK_UZ_CALENDAR_SPEC.md Part 4 (verified against НК РУз)
 *
 * Run: npx tsx prisma/seed-april-2026.ts
 */

import { PrismaClient, TaxType, EventType, OrgType, TaxRegime } from "@prisma/client";

const prisma = new PrismaClient();

const LLC_JSC = [OrgType.LLC, OrgType.JSC];
const LLC_JSC_IE = [OrgType.LLC, OrgType.JSC, OrgType.IE];
const LLC_JSC_IE_SE = [OrgType.LLC, OrgType.JSC, OrgType.IE, OrgType.SELF_EMPLOYED];
const IE_ONLY = [OrgType.IE];
const VAT_TURNOVER = [TaxRegime.VAT, TaxRegime.TURNOVER];
const VAT_ONLY = [TaxRegime.VAT];
const TURNOVER_ONLY = [TaxRegime.TURNOVER];

const events = [
  // ─────────── 1 апреля ───────────

  // #1 Статотчёт 1 korxona shakli за 2025
  {
    year: 2026, month: 4,
    date: new Date("2026-04-01"),
    taxType: TaxType.FEES,
    eventType: EventType.REPORT,
    titleRu: "Статотчёт 1 korxona shakli за 2025 год",
    titleEn: "Statistical report 1 korxona shakli for 2025",
    titleUz: "2025 yil uchun 1 korxona shakli statistik hisoboti",
    titleUzc: "2025 йил учун 1 korxona shakli статистик ҳисоботи",
    descRu: "Последний день представления статистического отчёта по форме 1 korxona shakli за 2025 год предприятиями, ведущими бухучёт по НСБУ. Предприятия на МСФО отчитываются не позднее 5 мая.",
    descEn: "Deadline for submitting statistical report form 1 korxona shakli for 2025 by NSBU accounting enterprises. IFRS enterprises report by May 5.",
    descUz: "NSBX bo'yicha hisob yurituvchi korxonalar tomonidan 2025 yil uchun 1 korxona shakli statistik hisobotini taqdim etishning oxirgi kuni.",
    descUzc: "НСБУ бўйича ҳисоб юритувчи корхоналар томонидан 2025 йил учун 1 korxona shakli статистик ҳисоботини тақдим этишнинг охирги куни.",
    articleRef: "Госкомстат",
    orgTypes: LLC_JSC,
    taxRegimes: VAT_TURNOVER,
    isPublished: true, isDraft: false,
  },

  // ─────────── 6 апреля (перенос с 5 апреля — воскресенье) ───────────

  // #2 Налог на прибыль банков с нерезидентов за март 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-06"),
    originalDate: new Date("2026-04-05"),
    isPostponed: true,
    postponeReasonRu: "5 апреля — воскресенье, срок переносится на следующий рабочий день",
    postponeReasonEn: "April 5 is Sunday, deadline moved to next working day",
    postponeReasonUz: "5 aprel — yakshanba, muddat keyingi ish kuniga ko'chiriladi",
    postponeReasonUzc: "5 апрел — якшанба, муддат кейинги иш кунига кўчирилади",
    taxType: TaxType.PROFIT,
    eventType: EventType.PAYMENT,
    titleRu: "Уплата банками налога на прибыль с доходов нерезидентов за март 2026",
    titleEn: "Banks' profit tax on non-resident income for March 2026",
    titleUz: "Banklar tomonidan mart 2026 uchun norezidentlar daromadidan foyda solig'i",
    titleUzc: "Банклар томонидан март 2026 учун норезидентлар даромадидан фойда солиғи",
    descRu: "Банки уплачивают налог на прибыль с доходов, выплаченных нерезидентам в марте 2026 года (за исключением дивидендов и процентов). Срок перенесён с 5 апреля (воскресенье) на 6 апреля.",
    descEn: "Banks pay profit tax on income paid to non-residents in March 2026 (except dividends and interest). Deadline moved from April 5 (Sunday) to April 6.",
    descUz: "Banklar 2026 yil mart oyida norezidentlarga to'langan daromadlardan foyda solig'ini to'laydilar.",
    descUzc: "Банклар 2026 йил март ойида норезидентларга тўланган даромадлардан фойда солиғини тўлайдилар.",
    articleRef: "ст.355 ч.2 п.1 НК",
    orgTypes: LLC_JSC,
    taxRegimes: VAT_TURNOVER,
    requiresSpecial: ["non_resident_income"],
    isPublished: true, isDraft: false,
  },

  // ─────────── 7 апреля ───────────

  // #3 НДФЛ и ИНПС с натуральных выплат за март 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-07"),
    taxType: TaxType.PERSONAL_IT,
    eventType: EventType.PAYMENT,
    titleRu: "НДФЛ и ИНПС с доходов в натуральной форме за март 2026",
    titleEn: "PIT and INPS on in-kind income for March 2026",
    titleUz: "Mart 2026 uchun natural shaklda to'langan daromadlardan JSST va INPS",
    titleUzc: "Март 2026 учун натурал шаклда тўланган даромадлардан ЖССТ ва ИНПС",
    descRu: "При выплате доходов в натуральной форме НДФЛ и взносы ИНПС уплачиваются в течение 5 рабочих дней после окончания марта 2026 года.",
    descEn: "When income is paid in kind, PIT and INPS contributions are paid within 5 working days after end of March 2026.",
    descUz: "Natural shaklda to'langan daromadlar uchun JSST va INPS to'lovlar mart oyining oxiridan 5 ish kuni ichida amalga oshiriladi.",
    descUzc: "Натурал шаклда тўланган даромадлар учун ЖССТ ва ИНПС тўловлар март ойининг охиридан 5 иш куни ичида амалга оширилади.",
    articleRef: "ст.390 ч.2, Положение МЮ №3577 п.6",
    orgTypes: LLC_JSC_IE,
    taxRegimes: VAT_TURNOVER,
    requiresEmployees: true,
    isPublished: true, isDraft: false,
  },

  // ─────────── 9 апреля ───────────

  // #4 Сборы за реализацию алкоголя/пива/табака за апрель 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-09"),
    taxType: TaxType.FEES,
    eventType: EventType.PAYMENT,
    titleRu: "Сборы за право реализации алкоголя, пива, табака за апрель 2026",
    titleEn: "Fees for right to sell alcohol, beer, tobacco for April 2026",
    titleUz: "Aprel 2026 uchun spirtli ichimliklar, pivo, tamaki sotish huquqi uchun yig'imlar",
    titleUzc: "Апрел 2026 учун спиртли ичимликлар, пиво, тамаки сотиш ҳуқуқи учун йиғимлар",
    descRu: "Предоплата сборов за право реализации алкоголя, пива и табака за апрель 2026 года.",
    descEn: "Advance payment of fees for right to sell alcohol, beer and tobacco for April 2026.",
    descUz: "Aprel 2026 uchun spirtli ichimliklar, pivo va tamaki sotish huquqi uchun yig'imlarni oldindan to'lash.",
    descUzc: "Апрел 2026 учун спиртли ичимликлар, пиво ва тамаки сотиш ҳуқуқи учун йиғимларни олдиндан тўлаш.",
    articleRef: "ст.460 ч.6 НК",
    orgTypes: LLC_JSC,
    taxRegimes: VAT_TURNOVER,
    requiresSpecial: ["alcohol_tobacco"],
    isPublished: true, isDraft: false,
  },

  // ─────────── 10 апреля ───────────

  // #5 Акцизный налог за март 2026 — отчётность и уплата
  {
    year: 2026, month: 4,
    date: new Date("2026-04-10"),
    taxType: TaxType.EXCISE,
    eventType: EventType.BOTH,
    titleRu: "Отчётность и уплата акцизного налога за март 2026",
    titleEn: "Excise tax reporting and payment for March 2026",
    titleUz: "Mart 2026 uchun aksiz solig'i hisoboti va to'lovi",
    titleUzc: "Март 2026 учун акциз солиғи ҳисоботи ва тўлови",
    descRu: "Плательщики акцизного налога представляют отчётность и уплачивают налог за март 2026 года. Плательщики НсО освобождены (ст.461 НК).",
    descEn: "Excise tax payers file and pay for March 2026. Turnover tax payers are excluded (Art.461).",
    descUz: "Aksiz solig'i to'lovchilari mart 2026 uchun hisobot topshiradilar va soliq to'laydilar.",
    descUzc: "Акциз солиғи тўловчилари март 2026 учун ҳисобот топшириш ва солиқ тўлайдилар.",
    articleRef: "ст.292, 293 НК",
    orgTypes: LLC_JSC,
    taxRegimes: VAT_ONLY,
    requiresSpecial: ["excise"],
    isPublished: true, isDraft: false,
  },

  // #7 Авансы по налогу на имущество за апрель 2026 (1/12)
  {
    year: 2026, month: 4,
    date: new Date("2026-04-10"),
    taxType: TaxType.PROPERTY,
    eventType: EventType.PAYMENT,
    titleRu: "Авансовый платёж по налогу на имущество за апрель 2026 (1/12)",
    titleEn: "Property tax advance payment for April 2026 (1/12)",
    titleUz: "Aprel 2026 uchun mulk solig'i bo'yicha avans to'lov (1/12)",
    titleUzc: "Апрел 2026 учун мулк солиғи бўйича аванс тўлов (1/12)",
    descRu: "Плательщики НДС уплачивают ежемесячный авансовый платёж по налогу на имущество за апрель 2026 года (1/12 годовой суммы). Плательщики НсО платят квартально 20-го числа.",
    descEn: "VAT payers pay monthly property tax advance for April 2026 (1/12 of annual amount). Turnover tax payers pay quarterly by the 20th.",
    descUz: "QQS to'lovchilari aprel 2026 uchun mulk solig'i bo'yicha oylik avans to'lovini amalga oshiradilar (1/12).",
    descUzc: "ҚҚС тўловчилари апрел 2026 учун мулк солиғи бўйича ойлик аванс тўловини амалга оширадилар (1/12).",
    articleRef: "ст.417 ч.6 НК",
    orgTypes: LLC_JSC_IE,
    taxRegimes: VAT_ONLY,
    requiresAssets: ["property"],
    isPublished: true, isDraft: false,
  },

  // #8 Земельный налог несельхоз за апрель 2026 (1/12)
  {
    year: 2026, month: 4,
    date: new Date("2026-04-10"),
    taxType: TaxType.LAND,
    eventType: EventType.PAYMENT,
    titleRu: "Земельный налог (несельхоз) за апрель 2026 (1/12)",
    titleEn: "Land tax (non-agricultural) for April 2026 (1/12)",
    titleUz: "Aprel 2026 uchun yer solig'i (qishloq xo'jaligi bo'lmagan) (1/12)",
    titleUzc: "Апрел 2026 учун ер солиғи (қишлоқ хўжалиги бўлмаган) (1/12)",
    descRu: "Плательщики НДС уплачивают ежемесячный земельный налог по несельхозугодьям за апрель 2026 года (1/12). Плательщики НсО платят квартально.",
    descEn: "VAT payers pay monthly land tax for non-agricultural land for April 2026 (1/12). Turnover tax payers pay quarterly.",
    descUz: "QQS to'lovchilari aprel 2026 uchun qishloq xo'jaligi maqsadlarida foydalanilmaydigan yerlar uchun yer solig'ini to'laydilar (1/12).",
    descUzc: "ҚҚС тўловчилари апрел 2026 учун қишлоқ хўжалиги мақсадларида фойдаланилмайдиган ерлар учун ер солиғини тўлайдилар (1/12).",
    articleRef: "ст.432 ч.1 НК",
    orgTypes: LLC_JSC_IE,
    taxRegimes: VAT_ONLY,
    requiresAssets: ["land_non_agri"],
    isPublished: true, isDraft: false,
  },

  // #9 Заявка в ПФ (ребёнок-инвалид) за март 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-10"),
    taxType: TaxType.OTHER,
    eventType: EventType.REPORT,
    titleRu: "Заявка в Пенсионный фонд (ребёнок-инвалид) за март 2026",
    titleEn: "Pension Fund application (disabled child) for March 2026",
    titleUz: "Mart 2026 uchun Pensiya jamg'armasiga ariza (nogironligi bo'lgan bola)",
    titleUzc: "Март 2026 учун Пенсия жамғармасига ариза (ногиронлиги бўлган бола)",
    descRu: "Работодатели подают ежемесячную заявку в Пенсионный фонд на возмещение расходов по выплате пенсий детям-инвалидам до 16 лет за март 2026 года.",
    descEn: "Employers submit monthly Pension Fund application for reimbursement of disability pensions for children under 16 for March 2026.",
    descUz: "Ish beruvchilar mart 2026 uchun 16 yoshgacha bo'lgan nogironligi bo'lgan bolalar pensiyasi xarajatlarini qoplash uchun Pensiya jamg'armasiga oylik ariza topshiradilar.",
    descUzc: "Иш берувчилар март 2026 учун 16 ёшгача бўлган ногиронлиги бўлган болалар пенсияси харажатларини қоплаш учун Пенсия жамғармасига ойлик ариза топшириш.",
    articleRef: "ПКМ №661 пп.45-46",
    orgTypes: LLC_JSC_IE,
    taxRegimes: VAT_TURNOVER,
    requiresEmployees: true,
    requiresPension: ["disabled_child"],
    isPublished: true, isDraft: false,
  },

  // ─────────── 15 апреля ───────────

  // #10 Реестры и уплата ИНПС за март 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-15"),
    taxType: TaxType.INPS,
    eventType: EventType.BOTH,
    titleRu: "Реестры и уплата ИНПС за март 2026",
    titleEn: "INPS registers and contributions for March 2026",
    titleUz: "Mart 2026 uchun INPS reestrlari va badallari",
    titleUzc: "Март 2026 учун ИНПС рееструлари ва бадаллари",
    descRu: "Работодатели представляют реестры и уплачивают взносы на ИНПС за март 2026 года.",
    descEn: "Employers submit INPS registers and pay contributions for March 2026.",
    descUz: "Ish beruvchilar mart 2026 uchun INPS rejestrlarini topshiradilar va badallarni to'laydilar.",
    descUzc: "Иш берувчилар март 2026 учун ИНПС рееструларини топшириш ва бадалларни тўлайдилар.",
    articleRef: "Положение МЮ №3577 пп.6,9",
    orgTypes: LLC_JSC_IE,
    taxRegimes: VAT_TURNOVER,
    requiresEmployees: true,
    isPublished: true, isDraft: false,
  },

  // #12 Справка об авансах по прибыли за II кв 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-15"),
    taxType: TaxType.PROFIT,
    eventType: EventType.REPORT,
    titleRu: "Справка об авансах по налогу на прибыль за II квартал 2026",
    titleEn: "Profit tax advance schedule for Q2 2026",
    titleUz: "2026 yil II chorak uchun foyda solig'i bo'yicha avans to'lovlar ma'lumotnomasi",
    titleUzc: "2026 йил II чорак учун фойда солиғи бўйича аванс тўловлар маълумотномаси",
    descRu: "Последний день представления справки о сумме авансовых платежей по налогу на прибыль за II квартал 2026 года налогоплательщиками, чей совокупный доход за 2025 год превысил 20 млрд сум.",
    descEn: "Deadline for submitting the profit tax advance schedule for Q2 2026 by taxpayers whose aggregate 2025 income exceeded 20 billion UZS.",
    descUz: "2025 yil uchun yalpi daromadi 20 milliard so'mdan oshgan soliq to'lovchilar uchun 2026 yil II chorak uchun foyda solig'i bo'yicha avans to'lovlar ma'lumotnomasi taqdim etishning oxirgi kuni.",
    descUzc: "2025 йил учун ялпи даромади 20 миллиард сўмдан ошган солиқ тўловчилар учун 2026 йил II чорак учун аванс тўловлар маълумотномасини топширишнинг охирги куни.",
    articleRef: "ст.340 ч.11 НК",
    orgTypes: LLC_JSC,
    taxRegimes: VAT_ONLY,
    requiresSpecial: ["high_revenue_20b"],
    isPublished: true, isDraft: false,
  },

  // #13 НДФЛ и соцналог за март 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-15"),
    taxType: TaxType.SOCIAL,
    eventType: EventType.BOTH,
    titleRu: "Отчётность и уплата НДФЛ и социального налога за март 2026",
    titleEn: "PIT and social tax reporting and payment for March 2026",
    titleUz: "Mart 2026 uchun JSST va ijtimoiy soliq hisoboti va to'lovi",
    titleUzc: "Март 2026 учун ЖССТ ва ижтимоий солиқ ҳисоботи ва тўлови",
    descRu: "Работодатели представляют отчётность и уплачивают НДФЛ и социальный налог за март 2026 года.",
    descEn: "Employers file and pay PIT and social tax for March 2026.",
    descUz: "Ish beruvchilar mart 2026 uchun JSST va ijtimoiy soliq bo'yicha hisobot topshiradilar va to'laydilar.",
    descUzc: "Иш берувчилар март 2026 учун ЖССТ ва ижтимоий солиқ бўйича ҳисобот топшириш ва тўлайдилар.",
    articleRef: "ст.389, 390, 407 НК",
    orgTypes: LLC_JSC_IE,
    taxRegimes: VAT_TURNOVER,
    requiresEmployees: true,
    isPublished: true, isDraft: false,
  },

  // #13b Соцналог ИП за себя — март 2026 (обязательный, ст.408 п.1)
  {
    year: 2026, month: 4,
    date: new Date("2026-04-15"),
    taxType: TaxType.SOCIAL,
    eventType: EventType.PAYMENT,
    titleRu: "Уплата соцналога ИП за себя за март 2026 (≥1 БРВ/мес)",
    titleEn: "IE mandatory personal social tax for March 2026 (≥1 BRV/month)",
    titleUz: "YaTT uchun shaxsiy ijtimoiy soliq to'lovi — mart 2026 (≥1 BHM/oy)",
    titleUzc: "ЯТТ учун шахсий ижтимоий солиқ тўлови — март 2026 (≥1 БҲМ/ой)",
    descRu: "Индивидуальные предприниматели уплачивают обязательный социальный налог за себя — не менее 1 БРВ в месяц (ст.408 п.1 НК). Обязательство действует независимо от наличия наёмных работников.",
    descEn: "Individual entrepreneurs pay mandatory personal social tax of at least 1 BRV per month (Art. 408 para. 1 of the Tax Code). This obligation applies regardless of whether they have employees.",
    descUz: "Yakka tartibdagi tadbirkorlar (YaTT) o'zlari uchun oyiga kamida 1 BHM miqdorida ijtimoiy soliq to'lashlari shart (NK 408-modda 1-band). Bu majburiyat xodimlari bormi yo yo'qmi — farq qilmaydi.",
    descUzc: "Якка тартибдаги тадбиркорлар (ЯТТ) ўзлари учун ойига камида 1 БҲМ миқдорида ижтимоий солиқ тўлашлари шарт (НК 408-модда 1-банд). Бу мажбурият ходимлари борми йўқми — фарқ қилмайди.",
    articleRef: "ст.408 п.1 НК",
    orgTypes: IE_ONLY,
    taxRegimes: VAT_TURNOVER,
    isPublished: true, isDraft: false,
  },

  // #14 Налог с оборота за март 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-15"),
    taxType: TaxType.TURNOVER,
    eventType: EventType.BOTH,
    titleRu: "Отчётность и уплата налога с оборота за март 2026",
    titleEn: "Turnover tax reporting and payment for March 2026",
    titleUz: "Mart 2026 uchun aylanma soliq hisoboti va to'lovi",
    titleUzc: "Март 2026 учун айланма солиқ ҳисоботи ва тўлови",
    descRu: "Плательщики налога с оборота представляют отчётность и уплачивают налог за март 2026 года. Самозанятые — только если получают доход напрямую от физлиц.",
    descEn: "Turnover tax payers file and pay for March 2026. Self-employed — only if receiving income directly from individuals.",
    descUz: "Aylanma soliq to'lovchilari mart 2026 uchun hisobot topshiradilar va soliq to'laydilar.",
    descUzc: "Айланма солиқ тўловчилари март 2026 учун ҳисобот топшириш ва солиқ тўлайдилар.",
    articleRef: "ст.470 НК",
    orgTypes: LLC_JSC_IE_SE,
    taxRegimes: TURNOVER_ONLY,
    isPublished: true, isDraft: false,
  },

  // #15 НсО агенты по доходам ИП/самозанятых за март 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-15"),
    taxType: TaxType.TURNOVER,
    eventType: EventType.BOTH,
    titleRu: "НсО налоговые агенты по доходам ИП/самозанятых за март 2026",
    titleEn: "Turnover tax agents for IE/self-employed income for March 2026",
    titleUz: "Mart 2026 uchun YaTT/mustaqil ishlovchilar daromadidan NsO soliq agentlari",
    titleUzc: "Март 2026 учун ЯТТ/мустақил ишловчилар даромадидан НсО солиқ агентлари",
    descRu: "Юридические лица — налоговые агенты удерживают и перечисляют НсО с доходов, выплаченных ИП и самозанятым в марте 2026 года (ст.465 чч.4-5 НК).",
    descEn: "Legal entities acting as tax agents withhold and remit turnover tax on income paid to IE and self-employed in March 2026.",
    descUz: "Yuridik shaxslar — soliq agentlari mart 2026 da YaTT va mustaqil ishlovchilarga to'langan daromadlardan NsO ni ushlab qolishadi va o'tkazishadi.",
    descUzc: "Юридик шахслар — солиқ агентлари март 2026 да ЯТТ ва мустақил ишловчиларга тўланган даромадлардан НсО ни ушлаб қолишади.",
    articleRef: "ст.470, ст.465 чч.4-5 НК",
    orgTypes: LLC_JSC,
    taxRegimes: TURNOVER_ONLY,
    isPublished: true, isDraft: false,
  },

  // #16 Исправление ошибок ККТ за март 2026 (НсО)
  {
    year: 2026, month: 4,
    date: new Date("2026-04-15"),
    taxType: TaxType.TURNOVER,
    eventType: EventType.REPORT,
    titleRu: "Исправление ошибок ККТ за март 2026 (плательщики НсО)",
    titleEn: "Correction of cash register errors for March 2026 (turnover tax payers)",
    titleUz: "Mart 2026 uchun KKM xatolarini tuzatish (NsO to'lovchilari)",
    titleUzc: "Март 2026 учун ККМ хатоларини тузатиш (НсО тўловчилари)",
    descRu: "Последний день исправления технических ошибок в чеках онлайн-ККТ за март 2026 года для плательщиков налога с оборота.",
    descEn: "Last day to correct technical errors in online cash register receipts for March 2026 for turnover tax payers.",
    descUz: "Aylanma soliq to'lovchilari uchun mart 2026 bo'yicha onlayn-KKM cheklaridagi xatolarni tuzatishning oxirgi kuni.",
    descUzc: "Айланма солиқ тўловчилари учун март 2026 бўйича онлайн-ККМ чекларидаги хатоларни тузатишнинг охирги куни.",
    articleRef: "ПКМ №943 п.38-1, ст.470 НК",
    orgTypes: LLC_JSC_IE,
    taxRegimes: TURNOVER_ONLY,
    requiresSpecial: ["online_kkt"],
    isPublished: true, isDraft: false,
  },

  // ─────────── 20 апреля ───────────

  // #17 НДС за март 2026 — отчётность и уплата
  {
    year: 2026, month: 4,
    date: new Date("2026-04-20"),
    taxType: TaxType.VAT,
    eventType: EventType.BOTH,
    titleRu: "Отчётность и уплата НДС за март 2026",
    titleEn: "VAT reporting and payment for March 2026",
    titleUz: "Mart 2026 uchun QQS hisoboti va to'lovi",
    titleUzc: "Март 2026 учун ҚҚС ҳисоботи ва тўлови",
    descRu: "Плательщики НДС представляют отчётность и уплачивают налог за март 2026 года.",
    descEn: "VAT payers file the return and pay for March 2026.",
    descUz: "QQS to'lovchilari mart 2026 uchun hisobot topshiradilar va soliq to'laydilar.",
    descUzc: "ҚҚС тўловчилари март 2026 учун ҳисобот топшириш ва солиқ тўлайдилар.",
    articleRef: "ст.273 НК",
    orgTypes: LLC_JSC_IE,
    taxRegimes: VAT_ONLY,
    isPublished: true, isDraft: false,
  },

  // #18 НДС налоговые агенты за март 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-20"),
    taxType: TaxType.VAT,
    eventType: EventType.BOTH,
    titleRu: "НДС налоговые агенты за март 2026 (иностр. лица, госимущество)",
    titleEn: "VAT tax agents for March 2026 (foreign entities, state property)",
    titleUz: "Mart 2026 uchun QQS soliq agentlari (xorijiy shaxslar, davlat mulki)",
    titleUzc: "Март 2026 учун ҚҚС солиқ агентлари (хорижий шахслар, давлат мулки)",
    descRu: "Налоговые агенты по НДС представляют отчётность и уплачивают налог за март 2026 года.",
    descEn: "VAT tax agents file and pay for March 2026.",
    descUz: "QQS soliq agentlari mart 2026 uchun hisobot topshiradilar va soliq to'laydilar.",
    descUzc: "ҚҚС солиқ агентлари март 2026 учун ҳисобот топшириш ва солиқ тўлайдилар.",
    articleRef: "ст.273, 255, 256 НК",
    orgTypes: LLC_JSC_IE,
    taxRegimes: VAT_ONLY,
    isPublished: true, isDraft: false,
  },

  // #19 Налог на прибыль за I квартал 2026 — отчётность и уплата
  {
    year: 2026, month: 4,
    date: new Date("2026-04-20"),
    taxType: TaxType.PROFIT,
    eventType: EventType.BOTH,
    titleRu: "Отчётность и уплата налога на прибыль за I квартал 2026",
    titleEn: "Profit tax reporting and payment for Q1 2026",
    titleUz: "2026 yil I chorak uchun foyda solig'i hisoboti va to'lovi",
    titleUzc: "2026 йил I чорак учун фойда солиғи ҳисоботи ва тўлови",
    descRu: "Юридические лица — плательщики НДС представляют отчётность и уплачивают налог на прибыль за I квартал 2026 года. Бюджетные и НКО — только годовой расчёт.",
    descEn: "VAT-paying legal entities file and pay profit tax for Q1 2026. Budget organizations and NGOs — only annual return.",
    descUz: "QQS to'lovchi yuridik shaxslar 2026 yil I chorak uchun foyda solig'i hisobotini topshiradilar va to'laydilar.",
    descUzc: "ҚҚС тўловчи юридик шахслар 2026 йил I чорак учун фойда солиғи ҳисоботини топшириш ва тўлайдилар.",
    articleRef: "ст.339, 340 НК",
    orgTypes: LLC_JSC,
    taxRegimes: VAT_ONLY,
    isPublished: true, isDraft: false,
  },

  // #20 Авансы по водному налогу за апрель 2026 (1/12, >200 БРВ)
  {
    year: 2026, month: 4,
    date: new Date("2026-04-20"),
    taxType: TaxType.WATER,
    eventType: EventType.PAYMENT,
    titleRu: "Авансовый платёж по водному налогу за апрель 2026 (1/12, >200 БРВ)",
    titleEn: "Water use tax advance payment for April 2026 (1/12, >200 BRV)",
    titleUz: "Aprel 2026 uchun suv solig'i avans to'lovi (1/12, >200 BHM)",
    titleUzc: "Апрел 2026 учун сув солиғи аванс тўлови (1/12, >200 БҲМ)",
    descRu: "Плательщики НДС, у которых годовая сумма водного налога превышает 200 БРВ, уплачивают ежемесячный авансовый платёж за апрель 2026 года (1/12 годовой суммы). Прочие плательщики (НДС <200 БРВ, НсО, ИП) платят квартально.",
    descEn: "VAT payers with annual water tax exceeding 200 BRV pay monthly advance for April 2026 (1/12 of annual amount). Others (VAT <200 BRV, turnover tax, IE) pay quarterly.",
    descUz: "Yillik suv solig'i summa 200 BHM dan ortiq bo'lgan QQS to'lovchilari aprel 2026 uchun oylik avans to'lovini amalga oshiradilar (1/12).",
    descUzc: "Йиллик сув солиғи суммаси 200 БҲМ дан ортиқ бўлган ҚҚС тўловчилари апрел 2026 учун ойлик аванс тўловини амалга оширадилар (1/12).",
    articleRef: "ст.448 ч.3 НК",
    orgTypes: LLC_JSC,
    taxRegimes: VAT_ONLY,
    requiresAssets: ["water"],
    isPublished: true, isDraft: false,
  },

  // #21 Отчётность по налогу с доходов нерезидентов за март 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-20"),
    taxType: TaxType.PROFIT,
    eventType: EventType.REPORT,
    titleRu: "Отчётность по налогу с доходов нерезидентов за март 2026",
    titleEn: "Non-resident income tax reporting for March 2026",
    titleUz: "Mart 2026 uchun norezidentlar daromadidan soliq hisoboti",
    titleUzc: "Март 2026 учун норезидентлар даромадидан солиқ ҳисоботи",
    descRu: "Налоговые агенты представляют отчётность по налогу с доходов нерезидентов за март 2026 года.",
    descEn: "Tax agents file non-resident income tax report for March 2026.",
    descUz: "Soliq agentlari mart 2026 uchun norezidentlar daromadidan soliq bo'yicha hisobot topshiradilar.",
    descUzc: "Солиқ агентлари март 2026 учун норезидентлар даромадидан солиқ бўйича ҳисобот топшириш.",
    articleRef: "ст.355 чч.1-2 НК",
    orgTypes: LLC_JSC,
    taxRegimes: VAT_TURNOVER,
    requiresSpecial: ["non_resident_income"],
    isPublished: true, isDraft: false,
  },

  // #22 НДС иностранных юрлиц (электронные услуги) за I квартал 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-20"),
    taxType: TaxType.VAT,
    eventType: EventType.BOTH,
    titleRu: "НДС иностранных юрлиц (электронные услуги) за I квартал 2026",
    titleEn: "VAT by foreign legal entities (electronic services) for Q1 2026",
    titleUz: "Xorijiy yuridik shaxslar tomonidan elektron xizmatlar uchun QQS (I chorak 2026)",
    titleUzc: "Хорижий юридик шахслар томонидан электрон хизматлар учун ҚҚС (I чорак 2026)",
    descRu: "Иностранные юридические лица, оказывающие услуги в электронной форме физлицам на территории Узбекистана, представляют отчётность и уплачивают НДС за I квартал 2026 года.",
    descEn: "Foreign legal entities providing electronic services to individuals in Uzbekistan file and pay VAT for Q1 2026.",
    descUz: "O'zbekistonda jismoniy shaxslarga elektron xizmatlar ko'rsatuvchi xorijiy yuridik shaxslar 2026 yil I chorak uchun QQS hisobotini topshiradilar.",
    descUzc: "Ўзбекистонда жисмоний шахсларга электрон хизматлар кўрсатувчи хорижий юридик шахслар 2026 йил I чорак учун ҚҚС ҳисоботини топшириш.",
    articleRef: "ст.278-281 НК",
    orgTypes: LLC_JSC_IE,
    taxRegimes: VAT_ONLY,
    isPublished: true, isDraft: false,
  },

  // #23 Отчётность по налогу с дивидендов и процентов за март 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-20"),
    taxType: TaxType.PROFIT,
    eventType: EventType.REPORT,
    titleRu: "Отчётность по налогу с дивидендов и процентов за март 2026",
    titleEn: "Dividend and interest tax reporting for March 2026",
    titleUz: "Mart 2026 uchun dividendlar va foizlardan soliq hisoboti",
    titleUzc: "Март 2026 учун дивидендлар ва фоизлардан солиқ ҳисоботи",
    descRu: "Налоговые агенты представляют отчётность по налогу с дивидендов и процентов за март 2026 года. Уплата — не позднее даты выплаты дивидендов/процентов.",
    descEn: "Tax agents file dividend and interest tax report for March 2026. Payment due no later than the date of payment of dividends/interest.",
    descUz: "Soliq agentlari mart 2026 uchun dividendlar va foizlardan soliq bo'yicha hisobot topshiradilar.",
    descUzc: "Солиқ агентлари март 2026 учун дивидендлар ва фоизлардан солиқ бўйича ҳисобот топшириш.",
    articleRef: "ст.345 чч.5-6 НК",
    orgTypes: LLC_JSC,
    taxRegimes: VAT_TURNOVER,
    requiresSpecial: ["dividends"],
    isPublished: true, isDraft: false,
  },

  // #24 Налог за пользование недрами за март 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-20"),
    taxType: TaxType.RENT,
    eventType: EventType.BOTH,
    titleRu: "Налог за пользование недрами за март 2026",
    titleEn: "Subsoil use tax for March 2026",
    titleUz: "Mart 2026 uchun yer osti boyliklaridan foydalanish solig'i",
    titleUzc: "Март 2026 учун ер ости бойликларидан фойдаланиш солиғи",
    descRu: "Пользователи недр представляют отчётность и уплачивают налог за пользование недрами за март 2026 года. Плательщики НсО освобождены (ст.461 НК).",
    descEn: "Subsoil users file and pay subsoil use tax for March 2026. Turnover tax payers are excluded (Art.461).",
    descUz: "Yer osti boyliklaridan foydalanuvchilar mart 2026 uchun soliq hisoboti topshiradilar va to'laydilar.",
    descUzc: "Ер ости бойликларидан фойдаланувчилар март 2026 учун солиқ ҳисоботи топшириш ва тўлайдилар.",
    articleRef: "ст.454 чч.3-4 НК",
    orgTypes: LLC_JSC,
    taxRegimes: VAT_ONLY,
    requiresSpecial: ["subsoil"],
    isPublished: true, isDraft: false,
  },

  // #25 Спецрентный налог за I квартал 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-20"),
    taxType: TaxType.RENT,
    eventType: EventType.BOTH,
    titleRu: "Спецрентный налог за I квартал 2026",
    titleEn: "Special rental tax for Q1 2026",
    titleUz: "2026 yil I chorak uchun maxsus renta solig'i",
    titleUzc: "2026 йил I чорак учун махсус рента солиғи",
    descRu: "Плательщики спецрентного налога представляют отчётность и уплачивают налог за I квартал 2026 года. При рентном убытке только годовой расчёт (1 марта).",
    descEn: "Special rental tax payers file and pay for Q1 2026. In case of rental loss — only annual return (March 1).",
    descUz: "Maxsus renta solig'i to'lovchilari 2026 yil I chorak uchun hisobot topshiradilar va to'laydilar.",
    descUzc: "Махсус рента солиғи тўловчилари 2026 йил I чорак учун ҳисобот топшириш ва тўлайдилар.",
    articleRef: "ст.454-7 НК",
    orgTypes: LLC_JSC,
    taxRegimes: VAT_ONLY,
    requiresSpecial: ["subsoil"],
    isPublished: true, isDraft: false,
  },

  // #26 Исправление ошибок ККТ за март 2026 (плательщики НДС)
  {
    year: 2026, month: 4,
    date: new Date("2026-04-20"),
    taxType: TaxType.VAT,
    eventType: EventType.REPORT,
    titleRu: "Исправление ошибок ККТ за март 2026 (плательщики НДС)",
    titleEn: "Correction of cash register errors for March 2026 (VAT payers)",
    titleUz: "Mart 2026 uchun KKM xatolarini tuzatish (QQS to'lovchilari)",
    titleUzc: "Март 2026 учун ККМ хатоларини тузатиш (ҚҚС тўловчилари)",
    descRu: "Последний день исправления технических ошибок в чеках онлайн-ККТ за март 2026 года для плательщиков НДС.",
    descEn: "Last day to correct technical errors in online cash register receipts for March 2026 for VAT payers.",
    descUz: "QQS to'lovchilari uchun mart 2026 bo'yicha onlayn-KKM cheklaridagi xatolarni tuzatishning oxirgi kuni.",
    descUzc: "ҚҚС тўловчилари учун март 2026 бўйича онлайн-ККМ чекларидаги хатоларни тузатишнинг охирги куни.",
    articleRef: "ПКМ №943 п.38-1, ст.273 НК",
    orgTypes: LLC_JSC_IE,
    taxRegimes: VAT_ONLY,
    requiresSpecial: ["online_kkt"],
    isPublished: true, isDraft: false,
  },

  // ─────────── 23 апреля ───────────

  // #27 Авансовый платёж по налогу на прибыль за апрель 2026 (>20 млрд)
  {
    year: 2026, month: 4,
    date: new Date("2026-04-23"),
    taxType: TaxType.PROFIT,
    eventType: EventType.PAYMENT,
    titleRu: "Авансовый платёж по налогу на прибыль за апрель 2026 (доход >20 млрд)",
    titleEn: "Profit tax advance payment for April 2026 (revenue >20 billion)",
    titleUz: "Aprel 2026 uchun foyda solig'i bo'yicha avans to'lov (daromad >20 mlrd)",
    titleUzc: "Апрел 2026 учун фойда солиғи бўйича аванс тўлов (даромад >20 млрд)",
    descRu: "Юридические лица, чей совокупный доход за 2025 год превысил 20 млрд сум, уплачивают ежемесячный авансовый платёж по налогу на прибыль за апрель 2026 года.",
    descEn: "Legal entities with aggregate 2025 income exceeding 20 billion UZS pay the monthly profit tax advance for April 2026.",
    descUz: "2025 yil uchun yalpi daromadi 20 milliard so'mdan oshgan yuridik shaxslar aprel 2026 uchun foyda solig'i bo'yicha oylik avans to'lovini amalga oshiradilar.",
    descUzc: "2025 йил учун ялпи даромади 20 миллиард сўмдан ошган юридик шахслар апрел 2026 учун фойда солиғи бўйича ойлик аванс тўловини амалга оширадилар.",
    articleRef: "ст.340 чч.2,7-8 НК",
    orgTypes: LLC_JSC,
    taxRegimes: VAT_ONLY,
    requiresSpecial: ["high_revenue_20b"],
    isPublished: true, isDraft: false,
  },

  // ─────────── 27 апреля (перенос с 25 апреля — суббота) ───────────

  // #28 Возмещение расходов ПФ за март 2026
  {
    year: 2026, month: 4,
    date: new Date("2026-04-27"),
    originalDate: new Date("2026-04-25"),
    isPostponed: true,
    postponeReasonRu: "25 апреля — суббота, срок переносится на следующий рабочий день",
    postponeReasonEn: "April 25 is Saturday, deadline moved to next working day",
    postponeReasonUz: "25 aprel — shanba, muddat keyingi ish kuniga ko'chiriladi",
    postponeReasonUzc: "25 апрел — шанба, муддат кейинги иш кунига кўчирилади",
    taxType: TaxType.OTHER,
    eventType: EventType.PAYMENT,
    titleRu: "Возмещение расходов Пенсионного фонда за март 2026",
    titleEn: "Reimbursement of Pension Fund expenses for March 2026",
    titleUz: "Mart 2026 uchun Pensiya jamg'armasi xarajatlarini qoplash",
    titleUzc: "Март 2026 учун Пенсия жамғармаси харажатларини қоплаш",
    descRu: "Работодатели перечисляют в Пенсионный фонд средства в возмещение расходов по выплаченным пенсиям за март 2026 года. Срок перенесён с 25 апреля (суббота) на 27 апреля.",
    descEn: "Employers reimburse the Pension Fund for pensions paid for March 2026. Deadline moved from April 25 (Saturday) to April 27.",
    descUz: "Ish beruvchilar mart 2026 uchun to'langan pensiyalar bo'yicha Pensiya jamg'armasi xarajatlarini qoplash uchun mablag' o'tkazadilar.",
    descUzc: "Иш берувчилар март 2026 учун тўланган пенсиялар бўйича Пенсия жамғармаси харажатларини қоплаш учун маблағ ўтказадилар.",
    articleRef: "ПКМ №661 п.32",
    orgTypes: LLC_JSC_IE,
    taxRegimes: VAT_TURNOVER,
    requiresEmployees: true,
    requiresPension: ["loss_of_breadwinner"],
    isPublished: true, isDraft: false,
  },
];

async function main() {
  console.log("Seeding April 2026 events (spec-correct version)...");
  let created = 0;
  let skipped = 0;

  // Remove old incorrect April 2026 events
  const deleted = await prisma.taxEvent.deleteMany({
    where: { year: 2026, month: 4 },
  });
  console.log(`Deleted ${deleted.count} existing April 2026 events.`);

  for (const event of events) {
    await prisma.taxEvent.create({ data: event as never });
    console.log(`  ✓ ${event.date.toISOString().slice(0, 10)} — ${event.titleRu.slice(0, 60)}`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
