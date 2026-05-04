import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Публичная оферта — Trek.uz" };

const CONTENT = {
  ru: {
    title: "Публичная оферта",
    subtitle: "Об использовании онлайн-сервиса Trek.uz",
    meta: "г. Ташкент · Версия, действующая с 1 марта 2026 г.",
    intro1: "Настоящий документ является официальным предложением (публичной офертой) Батиров Камронбек, самозанятого лица, зарегистрированного в соответствии с законодательством Республики Узбекистан (свидетельство о регистрации самозанятого лица №0006814588; ИНН: 631 292 863; ПИНФЛ: 50607026520010) (далее — «Исполнитель» или «Trek.uz») дееспособным физическим и юридическим лицам (далее — «Пользователь») заключить договор оказания информационных услуг в соответствии со ст. 367 и ч. 2 ст. 369 Гражданского кодекса Республики Узбекистан по использованию онлайн-сервиса Trek.uz (далее — «Договор» или «Оферта»).",
    intro2: "Выполнение Пользователем действий, предусмотренных п. 2.1 настоящей Оферты, означает его полное и безоговорочное согласие с нижеприведёнными условиями (акцепт Оферты). С момента акцепта Оферты Договор считается заключённым.",
    s1_title: "1. Термины и определения",
    s1: [
      ["1.1.", "Сервис Trek.uz (далее — «Сервис»)", "— онлайн-сервис, доступный по адресу trek.uz, предоставляющий Пользователю информацию о сроках уплаты налогов, сдачи отчётности и выполнения иных обязательств в соответствии с налоговым законодательством Республики Узбекистан, а также инструменты для управления налоговым календарём, получения уведомлений, использования AI-помощника и иного функционала Сервиса."],
      ["1.2.", "Пользователь", "— дееспособное физическое лицо или юридическое лицо, принявшее условия настоящей Оферты."],
      ["1.3.", "Тариф", "— план использования Сервиса, определяющий объём доступного функционала и стоимость. Актуальные тарифы размещены на странице trek.uz/pricing."],
      ["1.4.", "Тариф Free", "— бесплатный тарифный план: просмотр налогового календаря, фильтрация, просмотр деталей событий, уведомления внутри Сервиса."],
      ["1.5.", "Тариф Pro", "— платный тариф, 79 000 сум/месяц: персонализированный календарь, уведомления через Telegram, экспорт (PDF/Excel/ICS), AI-помощник (до 50 запросов/мес.), синхронизация с Google Calendar, приоритетная поддержка."],
      ["1.6.", "Подписка", "— оплаченный период использования Тарифа Pro."],
      ["1.7.", "Персональные данные", "— информация, относящаяся к определённому физическому лицу, предоставленная при регистрации и в процессе использования Сервиса."],
      ["1.8.", "AI-помощник (Треки)", "— функционал Сервиса для получения ответов на вопросы по налоговому законодательству РУз с использованием искусственного интеллекта."],
    ],
    s2_title: "2. Порядок акцепта",
    s2: [
      ["2.1.", "Акцепт осуществляется путём регистрации Пользователя на trek.uz/register."],
      ["2.2.", "Регистрируясь, Пользователь даёт согласие на обработку персональных данных в соответствии с Политикой конфиденциальности (trek.uz/privacy)."],
      ["2.3.", "Исполнитель гарантирует принятие необходимых мер по обеспечению конфиденциальности персональных данных."],
    ],
    s3_title: "3. Предмет договора",
    s3: [
      ["3.1.", "Исполнитель предоставляет доступ к Сервису Trek.uz для просмотра налогового календаря, получения уведомлений, использования AI-помощника и экспорта данных."],
      ["3.2.", "Информация Сервиса, включая ответы AI-помощника, носит справочный характер. Сервис не оказывает юридических, налоговых или бухгалтерских консультаций. Для принятия решений рекомендуется обращаться к квалифицированным специалистам."],
      ["3.3.", "Исполнитель прилагает разумные усилия для обеспечения актуальности информации, но не гарантирует абсолютную точность и полноту данных."],
      ["3.4.", "Активация Тарифа Pro производится на странице trek.uz/billing."],
    ],
    s4_title: "4. Стоимость и оплата",
    s4: [
      ["4.1.", "Тариф Free — бесплатно и бессрочно."],
      ["4.2.", "Тариф Pro — 79 000 сум/месяц. Актуальная стоимость указана на trek.uz/pricing."],
      ["4.3.", "Оплата через Payme (payme.uz) картами Uzcard и/или HUMO. После успешной оплаты подписка активируется автоматически."],
      ["4.4.", "Подписка действует 30 календарных дней. После окончания доступ к Pro приостанавливается, данные и настройки сохраняются."],
      ["4.5.", "Исполнитель вправе изменять стоимость Pro, уведомив Пользователя не менее чем за 30 дней."],
      ["4.6.", "Возврат средств за оплаченный период не производится, за исключением случаев, предусмотренных законодательством РУз."],
    ],
    s5_title: "5. Обязательства сторон",
    s5: [
      ["5.1.", "Исполнитель обязуется: обеспечивать работоспособность Сервиса; принимать меры по защите персональных данных; своевременно информировать об изменениях."],
      ["5.2.", "Исполнитель вправе: ограничить доступ при нарушении условий; проводить профилактические работы; изменять функционал без предварительного уведомления."],
      ["5.3.", "Пользователь обязуется: соблюдать условия Договора; предоставлять достоверные данные; обеспечивать безопасность учётной записи; не использовать Сервис в незаконных целях."],
    ],
    s6_title: "6. Ограничение ответственности",
    s6: [
      ["6.1.", "Сервис предоставляется «как есть» (as is). Исполнитель не несёт ответственности за убытки, возникшие вследствие использования или невозможности использования Сервиса."],
      ["6.2.", "Исполнитель не несёт ответственности за решения Пользователя, принятые на основе информации Сервиса."],
      ["6.3.", "Исполнитель не несёт ответственности за сбои, вызванные действиями третьих лиц, форс-мажором или перебоями в работе сетей."],
      ["6.4.", "Совокупная ответственность Исполнителя ограничивается суммой, уплаченной Пользователем за последние 3 месяца использования Тарифа Pro."],
    ],
    s7_title: "7. Расторжение договора",
    s7: [
      ["7.1.", "Пользователь вправе расторгнуть Договор в любой момент, удалив учётную запись или направив запрос на hi@kama.uz."],
      ["7.2.", "Исполнитель вправе расторгнуть Договор в одностороннем порядке при нарушении п. 5.2(а)."],
      ["7.3.", "При расторжении доступ прекращается, персональные данные уничтожаются в соответствии с Политикой конфиденциальности."],
    ],
    s8_title: "8. Рассмотрение споров",
    s8: [
      ["8.1.", "Споры разрешаются путём переговоров. Претензии направляйте на hi@kama.uz."],
      ["8.2.", "Срок рассмотрения претензии — 15 рабочих дней с момента получения."],
      ["8.3.", "При невозможности урегулирования спор рассматривается судом по месту жительства Исполнителя согласно законодательству РУз."],
    ],
    s9_title: "9. Прочие условия",
    s9: [
      ["9.1.", "Исполнитель вправе изменять Оферту, публикуя изменения на trek.uz/terms. Изменения вступают в силу не ранее 15 дней с момента публикации."],
      ["9.2.", "Продолжение использования Сервиса после вступления изменений в силу означает акцепт новой редакции."],
      ["9.3.", "Во всём остальном стороны руководствуются законодательством Республики Узбекистан."],
      ["9.4.", "Акцептом настоящей Оферты Пользователь подтверждает согласие с Политикой конфиденциальности (trek.uz/privacy)."],
    ],
    s10_title: "10. Реквизиты Исполнителя",
    details_label: "Реквизиты",
  },
  en: {
    title: "Public Offer Agreement",
    subtitle: "Use of Trek.uz online service",
    meta: "Tashkent · Effective from 1 March 2026",
    intro1: "This document constitutes an official public offer by Batirov Kamronbek, self-employed individual registered under the laws of the Republic of Uzbekistan (INN: 631 292 863; PINFL: 50607026520010) (hereinafter — \"Service Provider\" or \"Trek.uz\") to legally capable individuals and legal entities (hereinafter — \"User\") to enter into an information services agreement for the use of the Trek.uz online service.",
    intro2: "Performing the actions specified in clause 2.1 constitutes the User's full and unconditional acceptance of these terms. The agreement is deemed concluded from the moment of acceptance.",
    s1_title: "1. Definitions",
    s1: [
      ["1.1.", "Trek.uz Service", "— online service at trek.uz providing information on tax payment deadlines, reporting obligations, and other statutory requirements under Uzbek tax law, plus tools for tax calendar management, notifications, and AI assistance."],
      ["1.2.", "User", "— legally capable individual or legal entity that has accepted these terms."],
      ["1.3.", "Tariff", "— service plan defining available features and pricing. Current plans at trek.uz/pricing."],
      ["1.4.", "Free Plan", "— free plan: tax calendar access, filtering, event details, in-app notifications."],
      ["1.5.", "Pro Plan", "— paid plan, 79,000 UZS/month: personalised calendar, Telegram notifications, exports (PDF/Excel/ICS), AI assistant (50 requests/month), Google Calendar sync, priority support."],
      ["1.6.", "Subscription", "— paid period of Pro Plan use."],
      ["1.7.", "Personal Data", "— information identifying a specific individual, provided during registration."],
      ["1.8.", "AI Assistant (Treki)", "— Service feature providing AI-powered answers on Uzbek tax law."],
    ],
    s2_title: "2. Acceptance",
    s2: [
      ["2.1.", "Acceptance is made by registering at trek.uz/register."],
      ["2.2.", "By registering, the User consents to personal data processing in accordance with the Privacy Policy (trek.uz/privacy)."],
      ["2.3.", "The Service Provider commits to taking all necessary measures to protect personal data confidentiality."],
    ],
    s3_title: "3. Subject Matter",
    s3: [
      ["3.1.", "The Service Provider grants access to Trek.uz for viewing the tax calendar, receiving notifications, using the AI assistant, and exporting data."],
      ["3.2.", "All information on the Service, including AI assistant responses, is for informational purposes only. The Service does not provide legal, tax, or accounting advice. Users should consult qualified professionals."],
      ["3.3.", "The Service Provider makes reasonable efforts to keep information current but does not guarantee absolute accuracy."],
      ["3.4.", "Pro Plan activation is available at trek.uz/billing."],
    ],
    s4_title: "4. Pricing and Payment",
    s4: [
      ["4.1.", "Free Plan — free of charge, indefinitely."],
      ["4.2.", "Pro Plan — 79,000 UZS/month. Current price at trek.uz/pricing."],
      ["4.3.", "Payment via Payme (payme.uz) using Uzcard and/or HUMO cards. Subscription activates automatically upon payment."],
      ["4.4.", "Subscription is valid for 30 days. Pro access is suspended after expiry; user data and settings are preserved."],
      ["4.5.", "The Service Provider may change Pro pricing with at least 30 days' notice."],
      ["4.6.", "No refunds for paid periods, except as required by Uzbek law."],
    ],
    s5_title: "5. Obligations",
    s5: [
      ["5.1.", "Service Provider shall: maintain service availability; protect personal data; notify users of changes."],
      ["5.2.", "Service Provider may: restrict access for terms violations; perform maintenance; modify features without notice."],
      ["5.3.", "User shall: comply with these terms; provide accurate registration data; maintain account security; not use the Service for illegal purposes."],
    ],
    s6_title: "6. Limitation of Liability",
    s6: [
      ["6.1.", "The Service is provided \"as is\". The Service Provider is not liable for damages resulting from use or inability to use the Service."],
      ["6.2.", "The Service Provider is not liable for decisions made based on Service information."],
      ["6.3.", "The Service Provider is not liable for outages caused by third parties, force majeure, or network disruptions."],
      ["6.4.", "Total liability is limited to amounts paid by the User for the last 3 months of Pro Plan use."],
    ],
    s7_title: "7. Termination",
    s7: [
      ["7.1.", "User may terminate at any time by deleting their account or contacting hi@kama.uz."],
      ["7.2.", "Service Provider may terminate unilaterally for breaches under clause 5.2(a)."],
      ["7.3.", "Upon termination, access ceases and personal data is deleted per the Privacy Policy."],
    ],
    s8_title: "8. Dispute Resolution",
    s8: [
      ["8.1.", "Disputes shall be resolved through negotiation. Submit claims to hi@kama.uz."],
      ["8.2.", "Claims are reviewed within 15 business days of receipt."],
      ["8.3.", "Unresolved disputes are submitted to the court at the Service Provider's place of residence under Uzbek law."],
    ],
    s9_title: "9. Miscellaneous",
    s9: [
      ["9.1.", "The Service Provider may amend this offer by publishing updates at trek.uz/terms. Changes take effect no earlier than 15 days after publication."],
      ["9.2.", "Continued use after changes take effect constitutes acceptance of the new version."],
      ["9.3.", "All matters not addressed herein are governed by Uzbek law."],
      ["9.4.", "By accepting this offer, the User confirms agreement with the Privacy Policy (trek.uz/privacy)."],
    ],
    s10_title: "10. Service Provider Details",
    details_label: "Details",
  },
  uz: {
    title: "Ommaviy oferta",
    subtitle: "Trek.uz onlayn xizmatidan foydalanish",
    meta: "Toshkent · 2026 yil 1 martdan kuchga kirgan versiya",
    intro1: "Ushbu hujjat O'zbekiston Respublikasi qonunchiligiga muvofiq ro'yxatdan o'tgan, yakka tartibdagi faoliyat bilan shug'ullanuvchi Batirov Kamronbek (INN: 631 292 863; PINFL: 50607026520010) (keyingi o'rinlarda — «Ijrochi» yoki «Trek.uz») tomonidan jismoniy va yuridik shaxslarga (keyingi o'rinlarda — «Foydalanuvchi») Trek.uz onlayn xizmatidan foydalanish bo'yicha axborot xizmatlarini ko'rsatish shartnomasini tuzish to'g'risidagi rasmiy taklifdir (ommaviy oferta).",
    intro2: "Foydalanuvchining 2.1-bandida ko'rsatilgan harakatlarni bajarishi ushbu shartlarni to'liq va so'zsiz qabul qilganligini (ofertani aksept qilishni) bildiradi. Aksept lahzasidan boshlab shartnoma tuzilgan hisoblanadi.",
    s1_title: "1. Atamalar va ta'riflar",
    s1: [
      ["1.1.", "Trek.uz xizmati", "— trek.uz saytida mavjud bo'lgan onlayn xizmat bo'lib, O'zbekiston soliq qonunchiligi bo'yicha soliq to'lash, hisobot topshirish muddatlari va boshqa majburiyatlar haqida ma'lumot beradi."],
      ["1.2.", "Foydalanuvchi", "— ushbu oferta shartlarini qabul qilgan jismoniy yoki yuridik shaxs."],
      ["1.3.", "Tarif", "— xizmatdan foydalanish rejasi. Joriy tariflar trek.uz/pricing sahifasida."],
      ["1.4.", "Free tarif", "— bepul tarif: soliq kalendarini ko'rish, filtrlash, tadbirlar tafsilotlari, ilovadagi bildirishnomalar."],
      ["1.5.", "Pro tarif", "— pullik tarif, 79 000 so'm/oy: shaxsiylashtirilgan kalendar, Telegram bildirishnomalari, eksport (PDF/Excel/ICS), AI-yordamchi (oyiga 50 ta so'rov), Google Calendar bilan sinxronizatsiya."],
      ["1.6.", "Obuna", "— Pro tarif uchun to'langan foydalanish muddati."],
      ["1.7.", "Shaxsiy ma'lumotlar", "— ro'yxatdan o'tish vaqtida taqdim etilgan, foydalanuvchini identifikatsiyalash imkonini beruvchi ma'lumotlar."],
      ["1.8.", "AI-yordamchi (Treki)", "— O'zbekiston soliq qonunchiligi bo'yicha sun'iy intellekt yordamida javob beruvchi xizmat funksiyasi."],
    ],
    s2_title: "2. Qabul tartibi",
    s2: [
      ["2.1.", "Ofertani qabul qilish trek.uz/register sahifasida ro'yxatdan o'tish orqali amalga oshiriladi."],
      ["2.2.", "Ro'yxatdan o'tib, Foydalanuvchi trek.uz/privacy sahifasidagi Maxfiylik siyosatiga muvofiq ma'lumotlarni qayta ishlashga rozilik beradi."],
      ["2.3.", "Ijrochi shaxsiy ma'lumotlar maxfiyligini ta'minlash uchun barcha zarur choralarni ko'rishga majburdir."],
    ],
    s3_title: "3. Shartnoma predmeti",
    s3: [
      ["3.1.", "Ijrochi Foydalanuvchiga soliq kalendarini ko'rish, bildirishnomalar olish, AI-yordamchidan foydalanish va ma'lumotlarni eksport qilish imkonini beradi."],
      ["3.2.", "Xizmatdagi barcha ma'lumotlar, shu jumladan AI-yordamchi javoblari, faqat ma'lumotnoma xarakteriga ega. Xizmat huquqiy, soliq yoki buxgalteriya maslahati bermaydi."],
      ["3.3.", "Ijrochi ma'lumotlarning dolzarbligini ta'minlash uchun barcha oqilona choralarni ko'radi, lekin mutlaq to'g'rilikni kafolatlamaydi."],
      ["3.4.", "Pro tarifni faollashtirish trek.uz/billing sahifasida amalga oshiriladi."],
    ],
    s4_title: "4. Xizmat narxi va to'lov tartibi",
    s4: [
      ["4.1.", "Free tarif — bepul va muddatsiz."],
      ["4.2.", "Pro tarif — 79 000 so'm/oy. Joriy narx trek.uz/pricing da ko'rsatilgan."],
      ["4.3.", "To'lov Payme (payme.uz) orqali Uzcard va/yoki HUMO kartalari bilan amalga oshiriladi."],
      ["4.4.", "Obuna 30 kalendar kun amal qiladi. Muddati tugagandan so'ng Pro funksiyalariga kirish to'xtatiladi, ma'lumotlar va sozlamalar saqlanadi."],
      ["4.5.", "Ijrochi Pro narxini kamida 30 kun oldin xabardor qilib o'zgartirishi mumkin."],
      ["4.6.", "To'langan davr uchun pul qaytarilmaydi, O'zbekiston qonunchiligi talablari bundan mustasno."],
    ],
    s5_title: "5. Tomonlarning majburiyatlari",
    s5: [
      ["5.1.", "Ijrochi: xizmat ishlashini ta'minlaydi; shaxsiy ma'lumotlarni himoya qiladi; o'zgarishlar haqida o'z vaqtida xabardor qiladi."],
      ["5.2.", "Ijrochi: shartlar buzilganda kirishni cheklashi; profilaktika ishlari olib borishi; oldindan xabardor qilmasdan funksionallikni o'zgartirishi mumkin."],
      ["5.3.", "Foydalanuvchi: shartnoma shartlarini bajaradi; to'g'ri ma'lumot beradi; hisob xavfsizligini ta'minlaydi; xizmatni noqonuniy maqsadlarda ishlatmaydi."],
    ],
    s6_title: "6. Javobgarlikni cheklash",
    s6: [
      ["6.1.", "Xizmat «xuddi shundayligicha» (as is) taqdim etiladi. Ijrochi foydalanishdan kelib chiqadigan zararlar uchun javob bermaydi."],
      ["6.2.", "Ijrochi Foydalanuvchining xizmat ma'lumotlari asosida qabul qilgan qarorlari uchun javob bermaydi."],
      ["6.3.", "Ijrochi uchinchi shaxslar harakatlari, fors-major yoki tarmoq uzilishlari tufayli yuzaga kelgan nosozliklar uchun javob bermaydi."],
      ["6.4.", "Ijrochining umumiy javobgarligi Foydalanuvchi so'nggi 3 oyda Pro tarif uchun to'lagan miqdor bilan cheklanadi."],
    ],
    s7_title: "7. Shartnomani bekor qilish",
    s7: [
      ["7.1.", "Foydalanuvchi istalgan vaqtda hisobini o'chirib yoki hi@kama.uz manziliga so'rov yuborib shartnomani bekor qilishi mumkin."],
      ["7.2.", "Ijrochi 5.2(a)-band asosida shartnomani bir tomonlama bekor qilishi mumkin."],
      ["7.3.", "Bekor qilishda kirish to'xtatiladi, shaxsiy ma'lumotlar Maxfiylik siyosatiga muvofiq o'chiriladi."],
    ],
    s8_title: "8. Nizolarni hal etish tartibi",
    s8: [
      ["8.1.", "Nizolar muzokaralar yo'li bilan hal etiladi. Da'volarni hi@kama.uz manziliga yuboring."],
      ["8.2.", "Da'volar 15 ish kuni ichida ko'rib chiqiladi."],
      ["8.3.", "Hal etilmagan nizolar O'zbekiston qonunchiligi bo'yicha Ijrochi yashash joyi sudida ko'rib chiqiladi."],
    ],
    s9_title: "9. Boshqa shartlar",
    s9: [
      ["9.1.", "Ijrochi trek.uz/terms sahifasida yangi tahrir e'lon qilib ofertani o'zgartirishi mumkin. O'zgarishlar e'lon qilinganidan 15 kundan erta kuchga kirmaydi."],
      ["9.2.", "O'zgarishlar kuchga kirgandan keyin xizmatdan foydalanishni davom ettirish yangi tahririni qabul qilish hisoblanadi."],
      ["9.3.", "Shartnomada ko'rsatilmagan barcha masalalar O'zbekiston Respublikasi qonunchiligiga muvofiq tartibga solinadi."],
      ["9.4.", "Ushbu ofertani qabul qilish orqali Foydalanuvchi trek.uz/privacy Maxfiylik siyosatiga roziligini tasdiqlaydi."],
    ],
    s10_title: "10. Ijrochi rekvizitlari",
    details_label: "Rekvizitlar",
  },
  uzc: {
    title: "Оммавий оферта",
    subtitle: "Trek.uz онлайн хизматидан фойдаланиш",
    meta: "Тошкент · 2026 йил 1 мартдан кучга кирган версия",
    intro1: "Ушбу ҳужжат Ўзбекистон Республикаси қонунчилигига мувофиq рўйхатдан ўтган, якка тартибдаги фаолият билан шуғулланувчи Батиров Камронбек (ИНН: 631 292 863; ПИНФЛ: 50607026520010) (кейинги ўринларда — «Ижрочи» ёки «Trek.uz») томонидан жисмоний ва юридик шахсларга (кейинги ўринларда — «Фойдаланувчи») Trek.uz онлайн хизматидан фойдаланиш бўйича ахборот хизматларини кўрсатиш шартномасини тузиш тўғрисидаги расмий таклифдир (оммавий оферта).",
    intro2: "Фойдаланувчининг 2.1-бандида кўрсатилган ҳаракатларни бажариши ушбу шартларни тўлиқ ва сўзсиз қабул қилганлигини (офертани акцепт қилишни) билдиради. Акцепт лаҳзасидан бошлаб шартнома тузилган ҳисобланади.",
    s1_title: "1. Атамалар ва таърифлар",
    s1: [
      ["1.1.", "Trek.uz хизмати", "— trek.uz сайтида мавжуд бўлган онлайн хизмат бўлиб, Ўзбекистон солиқ қонунчилиги бўйича солиқ тўлаш, ҳисобот топшириш муддатлари ва бошқа мажбуриятлар ҳақида маълумот беради."],
      ["1.2.", "Фойдаланувчи", "— ушбу оферта шартларини қабул қилган жисмоний ёки юридик шахс."],
      ["1.3.", "Тариф", "— хизматдан фойдаланиш режаси. Жорий тарифлар trek.uz/pricing саҳифасида."],
      ["1.4.", "Free тариф", "— бепул тариф: солиқ календарини кўриш, фильтрлаш, тадбирлар тафсилотлари, иловадаги билдиришномалар."],
      ["1.5.", "Pro тариф", "— пуллик тариф, 79 000 сўм/ой: шахсийлаштирилган календар, Telegram билдиришномалари, экспорт (PDF/Excel/ICS), AI-ёрдамчи (ойига 50 та сўров), Google Calendar билан синхронизация."],
      ["1.6.", "Обуна", "— Pro тариф учун тўланган фойдаланиш муддати."],
      ["1.7.", "Шахсий маълумотлар", "— рўйхатдан ўтиш вақтида тақдим этилган, фойдаланувчини идентификациялаш имконини берувчи маълумотлар."],
      ["1.8.", "AI-ёрдамчи (Треки)", "— Ўзбекистон солиқ қонунчилиги бўйича сунъий интеллект ёрдамида жавоб берувчи хизмат функцияси."],
    ],
    s2_title: "2. Қабул тартиби",
    s2: [
      ["2.1.", "Офертани қабул қилиш trek.uz/register саҳифасида рўйхатдан ўтиш орқали амалга оширилади."],
      ["2.2.", "Рўйхатдан ўтиб, Фойдаланувчи trek.uz/privacy саҳифасидаги Махфийлик сиёсатига мувофиq маълумотларни қайта ишлашга розилик беради."],
      ["2.3.", "Ижрочи шахсий маълумотлар махфийлигини таъминлаш учун барча зарур чораларни кўришга мажбурдир."],
    ],
    s3_title: "3. Шартнома предмети",
    s3: [
      ["3.1.", "Ижрочи Фойдаланувчига солиқ календарини кўриш, билдиришномалар олиш, AI-ёрдамчидан фойдаланиш ва маълумотларни экспорт қилиш имконини беради."],
      ["3.2.", "Хизматдаги барча маълумотлар, шу жумладан AI-ёрдамчи жавоблари, фақат маълумотнома характерига эга. Хизмат ҳуқуқий, солиқ ёки бухгалтерия маслаҳати бермайди."],
      ["3.3.", "Ижрочи маълумотларнинг долзарблигини таъминлаш учун барча оқилона чораларни кўради, лекин мутлақ тўғрилигини кафолатламайди."],
      ["3.4.", "Pro тарифни фаоллаштириш trek.uz/billing саҳифасида амалга оширилади."],
    ],
    s4_title: "4. Хизмат нархи ва тўлов тартиби",
    s4: [
      ["4.1.", "Free тариф — бепул ва муддатсиз."],
      ["4.2.", "Pro тариф — 79 000 сўм/ой. Жорий нарх trek.uz/pricing да кўрсатилган."],
      ["4.3.", "Тўлов Payme (payme.uz) орқали Uzcard ва/ёки HUMO карталари билан амалга оширилади."],
      ["4.4.", "Обуна 30 календар кун амал қилади. Муддати тугагандан сўнг Pro функцияларига кириш тўхтатилади, маълумотлар ва созламалар сақланади."],
      ["4.5.", "Ижрочи Pro нархини камида 30 кун олдин хабардор қилиб ўзгартириши мумкин."],
      ["4.6.", "Тўланган давр учун пул қайтарилмайди, Ўзбекистон қонунчилиги талаблари бундан мустасно."],
    ],
    s5_title: "5. Томонларнинг мажбуриятлари",
    s5: [
      ["5.1.", "Ижрочи: хизмат ишлашини таъминлайди; шахсий маълумотларни ҳимоя қилади; ўзгаришлар ҳақида ўз вақтида хабардор қилади."],
      ["5.2.", "Ижрочи: шартлар бузилганда киришни чеклаши; профилактика ишлари олиб бориши; олдиндан хабардор қилмасдан функционалликни ўзгартириши мумкин."],
      ["5.3.", "Фойдаланувчи: шартнома шартларини бажаради; тўғри маълумот беради; ҳисоб хавфсизлигини таъминлайди; хизматни ноқонуний мақсадларда ишлатмайди."],
    ],
    s6_title: "6. Жавобгарликни чеклаш",
    s6: [
      ["6.1.", "Хизмат «худди шундайлигича» (as is) тақдим этилади. Ижрочи фойдаланишдан келиб чиқадиган зарарлар учун жавоб бермайди."],
      ["6.2.", "Ижрочи Фойдаланувчининг хизмат маълумотлари асосида қабул қилган қарорлари учун жавоб бермайди."],
      ["6.3.", "Ижрочи учинчи шахслар ҳаракатлари, форс-мажор ёки тармоқ узилишлари туфайли юзага келган носозликлар учун жавоб бермайди."],
      ["6.4.", "Ижрочининг умумий жавобгарлиги Фойдаланувчи сўнгги 3 ойда Pro тариф учун тўлаган миқдор билан чекланади."],
    ],
    s7_title: "7. Шартномани бекор қилиш",
    s7: [
      ["7.1.", "Фойдаланувчи истаган вақтда ҳисобини ўчириб ёки hi@kama.uz манзилига сўров юбориб шартномани бекор қилиши мумкин."],
      ["7.2.", "Ижрочи 5.2(а)-банд асосида шартномани бир томонлама бекор қилиши мумкин."],
      ["7.3.", "Бекор қилишда кириш тўхтатилади, шахсий маълумотлар Махфийлик сиёсатига мувофиq ўчирилади."],
    ],
    s8_title: "8. Низоларни ҳал этиш тартиби",
    s8: [
      ["8.1.", "Низолар музокаралар йўли билан ҳал этилади. Даъволарни hi@kama.uz манзилига юборинг."],
      ["8.2.", "Даъволар 15 иш куни ичида кўриб чиқилади."],
      ["8.3.", "Ҳал этилмаган низолар Ўзбекистон қонунчилиги бўйича Ижрочи яшаш жойи судида кўриб чиқилади."],
    ],
    s9_title: "9. Бошқа шартлар",
    s9: [
      ["9.1.", "Ижрочи trek.uz/terms саҳифасида янги таҳрир эълон қилиб офертани ўзгартириши мумкин. Ўзгаришлар эълон қилинганидан 15 кундан эрта кучга кирмайди."],
      ["9.2.", "Ўзгаришлар кучга киргандан кейин хизматдан фойдаланишни давом эттириш янги таҳририни қабул қилиш ҳисобланади."],
      ["9.3.", "Шартномада кўрсатилмаган барча масалалар Ўзбекистон Республикаси қонунчилигига мувофиq тартибга солинади."],
      ["9.4.", "Ушбу офертани қабул қилиш орқали Фойдаланувчи trek.uz/privacy Махфийлик сиёсатига розилигини тасдиқлайди."],
    ],
    s10_title: "10. Ижрочи реквизитлари",
    details_label: "Реквизитлар",
  },
} as const;

type Locale = "ru" | "en" | "uz" | "uzc";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CONTENT[(locale as Locale) in CONTENT ? (locale as Locale) : "ru"];

  return (
    <div className="min-h-screen bg-background">
      <Header user={null} />
      <main className="container mx-auto px-4 max-w-3xl py-12">
        <h1 className="text-3xl font-bold mb-1">{c.title}</h1>
        <p className="text-sm text-muted-foreground mb-1">{c.subtitle}</p>
        <p className="text-sm text-muted-foreground mb-8">{c.meta}</p>

        <div className="space-y-8 text-foreground">
          <p className="text-sm text-muted-foreground leading-relaxed">{c.intro1}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{c.intro2}</p>

          {[
            [c.s1_title, c.s1.map(([n, bold, rest]) => <p key={n}><strong>{n}</strong> <strong>{bold}</strong>{rest}</p>)],
            [c.s2_title, c.s2.map(([n, text]) => <p key={n}><strong>{n}</strong> {text}</p>)],
            [c.s3_title, c.s3.map(([n, text]) => <p key={n}><strong>{n}</strong> {text}</p>)],
            [c.s4_title, c.s4.map(([n, text]) => <p key={n}><strong>{n}</strong> {text}</p>)],
            [c.s5_title, c.s5.map(([n, text]) => <p key={n}><strong>{n}</strong> {text}</p>)],
            [c.s6_title, c.s6.map(([n, text]) => <p key={n}><strong>{n}</strong> {text}</p>)],
            [c.s7_title, c.s7.map(([n, text]) => <p key={n}><strong>{n}</strong> {text}</p>)],
            [c.s8_title, c.s8.map(([n, text]) => <p key={n}><strong>{n}</strong> {text}</p>)],
            [c.s9_title, c.s9.map(([n, text]) => <p key={n}><strong>{n}</strong> {text}</p>)],
          ].map(([title, items], i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold mb-3">{title as string}</h2>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">{items as React.ReactNode}</div>
            </section>
          ))}

          <section>
            <h2 className="text-lg font-semibold mb-3">{c.s10_title}</h2>
            <div className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground space-y-1.5">
              <p><strong>Батиров Камронбек</strong></p>
              <p>ИНН: 631 292 863 &nbsp;|&nbsp; ПИНФЛ: 50607026520010</p>
              <p>тупик Шивли, дом 11, Юнусабадский район, г. Ташкент, Узбекистан, 100084</p>
              <p>E-mail: <a href="mailto:hi@kama.uz" className="underline">hi@kama.uz</a></p>
              <p>Tel: <a href="tel:+998915856655" className="underline">+998 91 585-66-55</a></p>
              <p><a href="https://trek.uz" className="underline">trek.uz</a></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
