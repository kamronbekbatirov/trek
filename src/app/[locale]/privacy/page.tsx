import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Политика конфиденциальности — Trek.uz" };

const CONTENT = {
  ru: {
    title: "Политика конфиденциальности",
    subtitle: "Онлайн-сервис Trek.uz",
    meta: "г. Ташкент · Версия, действующая с 1 марта 2026 г.",
    intro: "Настоящая Политика конфиденциальности (далее — «Политика») разработана Батиров Камронбек, самозанятым лицом (ИНН: 631 292 863; ПИНФЛ: 50607026520010) (далее — «Trek.uz»). Использование Сервиса означает безоговорочное согласие с настоящей Политикой.",
    sections: [
      {
        title: "1. Информация, которую мы обрабатываем",
        items: [
          "Предоставляемая пользователем: email, имя, тип организации, режим налогообложения, ИНН (при указании), пароль в зашифрованном виде, Telegram ID при подключении уведомлений.",
          "Собираемая автоматически: IP-адрес, файлы cookie, информация о браузере и устройстве, время доступа.",
          "От третьих лиц: данные от Payme (идентификатор транзакции, статус, маскированный номер карты); от Google при синхронизации Calendar (токен авторизации).",
        ],
      },
      {
        title: "2. Цели обработки данных",
        items: [
          "Предоставление доступа к функционалу Сервиса: персонализированный календарь, уведомления, AI-помощник.",
          "Идентификация пользователя и обеспечение безопасности учётной записи.",
          "Обработка платежей и управление подписками через Payme.",
          "Направление уведомлений о приближающихся налоговых сроках.",
          "Улучшение качества Сервиса и разработка нового функционала.",
          "Обработка обращений в службу поддержки.",
        ],
      },
      {
        title: "3. Передача данных третьим лицам",
        items: [
          "Trek.uz передаёт данные только: с согласия пользователя; для работы Сервиса — Payme (платежи), Telegram (уведомления), Google (Calendar), Anthropic/Claude API (AI-помощник); по требованию законодательства РУз.",
          "Данные обрабатываются на серверах в Германии (Hetzner Online GmbH). Регистрируясь, пользователь даёт согласие на трансграничную передачу данных согласно ст. 15 Закона РУз «О персональных данных».",
          "При запросах к AI-помощнику Trek.uz не передаёт личные данные пользователя (email, имя, ИНН) в составе запросов.",
        ],
      },
      {
        title: "4. Файлы cookie",
        items: [
          "Сервис использует cookies для поддержания сессии авторизации и сбора обезличенной статистики.",
          "Пользователь может управлять cookies через настройки браузера. Отключение может ограничить функционал.",
        ],
      },
      {
        title: "5. Права пользователя",
        items: [
          "В соответствии со ст. 22 Закона РУз «О персональных данных», вы имеете право на: доступ к своим данным; их исправление и дополнение; удаление данных путём удаления учётной записи; отзыв согласия на обработку (запрос на hi@kama.uz).",
          "Запросы рассматриваются в течение 30 календарных дней.",
        ],
      },
      {
        title: "6. Защита данных",
        items: [
          "Пароли хранятся в зашифрованном виде (хэширование). Полные данные банковских карт не хранятся на серверах Trek.uz.",
          "Соединение защищено протоколом TLS (HTTPS).",
        ],
      },
      {
        title: "7. Сроки хранения",
        items: [
          "Данные хранятся не дольше, чем требуется для целей обработки.",
          "При удалении учётной записи данные уничтожаются в течение 30 дней, за исключением случаев, предусмотренных законодательством.",
        ],
      },
      {
        title: "8. Изменение Политики",
        items: [
          "Trek.uz вправе изменять Политику, публикуя новую редакцию на trek.uz/privacy.",
          "Продолжение использования Сервиса после публикации изменений означает согласие с ними.",
        ],
      },
    ],
    contacts_title: "9. Контакты",
    contacts_text: "По вопросам, связанным с обработкой персональных данных:",
  },
  en: {
    title: "Privacy Policy",
    subtitle: "Trek.uz online service",
    meta: "Tashkent · Effective from 1 March 2026",
    intro: "This Privacy Policy (\"Policy\") is developed by Batirov Kamronbek, self-employed individual (INN: 631 292 863; PINFL: 50607026520010) (\"Trek.uz\"). Using the Service constitutes unconditional acceptance of this Policy.",
    sections: [
      {
        title: "1. Information We Process",
        items: [
          "Provided by user: email, name, organisation type, tax regime, INN (if provided), encrypted password, Telegram ID for notifications.",
          "Collected automatically: IP address, cookies, browser and device info, access time.",
          "From third parties: Payme data (transaction ID, status, masked card number); Google Calendar sync (OAuth token).",
        ],
      },
      {
        title: "2. Purposes of Processing",
        items: [
          "Providing access to Service features: personalised calendar, notifications, AI assistant.",
          "User identification and account security.",
          "Payment processing and subscription management via Payme.",
          "Sending notifications about upcoming tax deadlines.",
          "Service improvement and new feature development.",
          "Handling support requests.",
        ],
      },
      {
        title: "3. Third-Party Data Sharing",
        items: [
          "Trek.uz only shares data: with user consent; for Service operation — Payme (payments), Telegram (notifications), Google (Calendar), Anthropic/Claude API (AI assistant); as required by Uzbek law.",
          "Data is processed on servers in Germany (Hetzner Online GmbH). By registering, users consent to cross-border data transfer per Article 15 of the Uzbek Law on Personal Data.",
          "Trek.uz does not send personal identifiers (email, name, INN) to the AI assistant.",
        ],
      },
      {
        title: "4. Cookies",
        items: [
          "The Service uses cookies for session management and anonymised analytics.",
          "Users can manage cookies through browser settings. Disabling may limit functionality.",
        ],
      },
      {
        title: "5. User Rights",
        items: [
          "Under Article 22 of the Uzbek Law on Personal Data, you have the right to: access your data; correct and update it; delete it by deleting your account; withdraw consent (request to hi@kama.uz).",
          "Requests are processed within 30 calendar days.",
        ],
      },
      {
        title: "6. Data Security",
        items: [
          "Passwords are stored encrypted (hashed). Full bank card data is not stored on Trek.uz servers.",
          "All connections are secured with TLS (HTTPS).",
        ],
      },
      {
        title: "7. Data Retention",
        items: [
          "Data is retained no longer than necessary for processing purposes.",
          "Upon account deletion, data is destroyed within 30 days, except where retention is required by law.",
        ],
      },
      {
        title: "8. Policy Updates",
        items: [
          "Trek.uz may update this Policy by publishing a new version at trek.uz/privacy.",
          "Continued use after publication constitutes acceptance of the updated Policy.",
        ],
      },
    ],
    contacts_title: "9. Contact",
    contacts_text: "For questions related to personal data processing:",
  },
  uz: {
    title: "Maxfiylik siyosati",
    subtitle: "Trek.uz onlayn xizmati",
    meta: "Toshkent · 2026 yil 1 martdan kuchga kirgan versiya",
    intro: "Ushbu Maxfiylik siyosati («Siyosat») yakka tartibdagi faoliyat bilan shug'ullanuvchi Batirov Kamronbek (INN: 631 292 863; PINFL: 50607026520010) («Trek.uz») tomonidan ishlab chiqilgan. Xizmatdan foydalanish ushbu Siyosatga so'zsiz rozilikni bildiradi.",
    sections: [
      {
        title: "1. Biz qayta ishlaydigan ma'lumotlar",
        items: [
          "Foydalanuvchi tomonidan taqdim etilgan: email, ism, tashkilot turi, soliq rejimi, INN (ko'rsatilganda), shifrlangan parol, bildirishnomalar uchun Telegram ID.",
          "Avtomatik to'planadigan: IP-manzil, cookie fayllar, brauzer va qurilma ma'lumotlari, kirish vaqti.",
          "Uchinchi shaxslardan: Payme ma'lumotlari (tranzaksiya identifikatori, holati, niqoblangan karta raqami); Google Calendar sinxronizatsiyasi (OAuth token).",
        ],
      },
      {
        title: "2. Ma'lumotlarni qayta ishlash maqsadlari",
        items: [
          "Xizmat funksiyalariga kirishni ta'minlash: shaxsiylashtirilgan kalendar, bildirishnomalar, AI-yordamchi.",
          "Foydalanuvchini identifikatsiya qilish va hisob xavfsizligini ta'minlash.",
          "Payme orqali to'lovlarni qayta ishlash va obunalarni boshqarish.",
          "Soliq muddatlari bo'yicha bildirishnomalar yuborish.",
          "Xizmat sifatini yaxshilash va yangi funksionallikni ishlab chiqish.",
          "Qo'llab-quvvatlash xizmatiga murojaatlarni ko'rib chiqish.",
        ],
      },
      {
        title: "3. Uchinchi shaxslarga ma'lumot berish",
        items: [
          "Trek.uz ma'lumotlarni faqat quyidagi hollarda beradi: foydalanuvchi roziligi bilan; xizmat ishlashi uchun — Payme (to'lovlar), Telegram (bildirishnomalar), Google (Calendar), Anthropic/Claude API (AI-yordamchi); O'zbekiston qonunchiligi talabi bilan.",
          "Ma'lumotlar Germaniyadagi serverlarda (Hetzner Online GmbH) qayta ishlanadi. Ro'yxatdan o'tib, foydalanuvchi chegara oshdi ma'lumotlarni uzatishga rozilik beradi.",
          "AI-yordamchiga so'rovlarda Trek.uz shaxsiy ma'lumotlarni (email, ism, INN) uzatmaydi.",
        ],
      },
      {
        title: "4. Cookie fayllar",
        items: [
          "Xizmat sessiyani boshqarish va anonimlashtiririlgan statistika uchun cookie fayllardan foydalanadi.",
          "Foydalanuvchi brauzer sozlamalari orqali cookie larni boshqarishi mumkin. O'chirish funksionallikni cheklashi mumkin.",
        ],
      },
      {
        title: "5. Foydalanuvchi huquqlari",
        items: [
          "O'zbekiston «Shaxsiy ma'lumotlar to'g'risida» Qonunining 22-moddasiga muvofiq siz quyidagi huquqlarga egasiz: ma'lumotlaringizga kirish; ularni to'g'rilash; hisobni o'chirish orqali ma'lumotlarni o'chirish; qayta ishlashga rozilikni qaytarib olish (hi@kama.uz ga so'rov).",
          "So'rovlar 30 kalendar kuni ichida ko'rib chiqiladi.",
        ],
      },
      {
        title: "6. Ma'lumotlarni himoya qilish",
        items: [
          "Parollar shifrlangan shaklda (xeshlash) saqlanadi. Bank kartasining to'liq ma'lumotlari Trek.uz serverlarida saqlanmaydi.",
          "Barcha ulanishlar TLS (HTTPS) protokoli bilan himoyalangan.",
        ],
      },
      {
        title: "7. Saqlash muddatlari",
        items: [
          "Ma'lumotlar qayta ishlash maqsadlaridan ortiq muddatda saqlanmaydi.",
          "Hisob o'chirilganda ma'lumotlar 30 kun ichida yo'q qilinadi, qonun talab qilgan hollar bundan mustasno.",
        ],
      },
      {
        title: "8. Siyosatni o'zgartirish",
        items: [
          "Trek.uz trek.uz/privacy sahifasida yangi tahrirni e'lon qilish orqali siyosatni o'zgartirishi mumkin.",
          "E'londan keyin xizmatdan foydalanishni davom ettirish yangilangan siyosatni qabul qilish hisoblanadi.",
        ],
      },
    ],
    contacts_title: "9. Bog'lanish",
    contacts_text: "Shaxsiy ma'lumotlarni qayta ishlash bo'yicha savollarga:",
  },
  uzc: {
    title: "Махфийлик сиёсати",
    subtitle: "Trek.uz онлайн хизмати",
    meta: "Тошкент · 2026 йил 1 мартдан кучга кирган версия",
    intro: "Ушбу Махфийлик сиёсати («Сиёсат») якка тартибдаги фаолият билан шуғулланувчи Батиров Камронбек (ИНН: 631 292 863; ПИНФЛ: 50607026520010) («Trek.uz») томонидан ишлаб чиқилган. Хизматдан фойдаланиш ушбу Сиёсатга сўзсиз розиликни билдиради.",
    sections: [
      {
        title: "1. Биз қайта ишлайдиган маълумотлар",
        items: [
          "Фойдаланувчи томонидан тақдим этилган: email, исм, ташкилот тури, солиқ режими, ИНН (кўрсатилганда), шифрланган парол, билдиришномалар учун Telegram ID.",
          "Автоматик тўпланадиган: IP-манзил, cookie файллар, браузер ва қурилма маълумотлари, кириш вақти.",
          "Учинчи шахслардан: Payme маълумотлари (трансакция идентификатори, ҳолати, ниқобланган карта рақами); Google Calendar синхронизацияси (OAuth token).",
        ],
      },
      {
        title: "2. Маълумотларни қайта ишлаш мақсадлари",
        items: [
          "Хизмат функцияларига киришни таъминлаш: шахсийлаштирилган календар, билдиришномалар, AI-ёрдамчи.",
          "Фойдаланувчини идентификация қилиш ва ҳисоб хавфсизлигини таъминлаш.",
          "Payme орқали тўловларни қайта ишлаш ва обуналарни бошқариш.",
          "Солиқ муддатлари бўйича билдиришномалар юбориш.",
          "Хизмат сифатини яхшилаш ва янги функционалликни ишлаб чиқиш.",
          "Қўллаб-қувватлаш хизматига мурожаатларни кўриб чиқиш.",
        ],
      },
      {
        title: "3. Учинчи шахсларга маълумот бериш",
        items: [
          "Trek.uz маълумотларни фақат қуйидаги ҳолларда беради: фойдаланувчи розилиги билан; хизмат ишлаши учун — Payme (тўловлар), Telegram (билдиришномалар), Google (Calendar), Anthropic/Claude API (AI-ёрдамчи); Ўзбекистон қонунчилиги талаби билан.",
          "Маълумотлар Германиядаги серверларда (Hetzner Online GmbH) қайта ишланади. Рўйхатдан ўтиб, фойдаланувчи чегара ошди маълумотларни узатишга розилик беради.",
          "AI-ёрдамчига сўровларда Trek.uz шахсий маълумотларни (email, исм, ИНН) узатмайди.",
        ],
      },
      {
        title: "4. Cookie файллар",
        items: [
          "Хизмат сессияни бошқариш ва аноним статистика учун cookie файллардан фойдаланади.",
          "Фойдаланувчи браузер созламалари орқали cookie ларни бошқариши мумкин.",
        ],
      },
      {
        title: "5. Фойдаланувчи ҳуқуқлари",
        items: [
          "Ўзбекистон «Шахсий маълумотлар тўғрисида» Қонунининг 22-моддасига мувофиq сиз қуйидаги ҳуқуқларга эгасиз: маълумотларингизга кириш; уларни тўғрилаш; ҳисобни ўчириш орқали маълумотларни ўчириш; қайта ишлашга розиликни қайтариб олиш (hi@kama.uz га сўров).",
          "Сўровлар 30 календар куни ичида кўриб чиқилади.",
        ],
      },
      {
        title: "6. Маълумотларни ҳимоя қилиш",
        items: [
          "Паролlar шифрланган шаклда (хешлаш) сақланади. Банк картасининг тўлиқ маълумотлари Trek.uz серверларида сақланмайди.",
          "Барча уланишлар TLS (HTTPS) протоколи билан ҳимояланган.",
        ],
      },
      {
        title: "7. Сақлаш муддатлари",
        items: [
          "Маълумотлар қайта ишлаш мақсадларидан ортиқ муддатда сақланмайди.",
          "Ҳисоб ўчирилганда маълумотлар 30 кун ичида йўқ қилинади, қонун талаб қилган ҳоллар бундан мустасно.",
        ],
      },
      {
        title: "8. Сиёсатни ўзгартириш",
        items: [
          "Trek.uz trek.uz/privacy саҳифасида янги таҳрирни эълон қилиш орқали сиёсатни ўзгартириши мумкин.",
          "Эълондан кейин хизматдан фойдаланишни давом эттириш янгиланган сиёсатни қабул қилиш ҳисобланади.",
        ],
      },
    ],
    contacts_title: "9. Боғланиш",
    contacts_text: "Шахсий маълумотларни қайта ишлаш бўйича саволларга:",
  },
} as const;

type Locale = "ru" | "en" | "uz" | "uzc";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
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
          <p className="text-sm text-muted-foreground leading-relaxed">{c.intro}</p>

          {c.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                {section.items.map((item, j) => (
                  <p key={j}>{item}</p>
                ))}
              </div>
            </section>
          ))}

          <section>
            <h2 className="text-lg font-semibold mb-2">{c.contacts_title}</h2>
            <p className="text-sm text-muted-foreground mb-3">{c.contacts_text}</p>
            <div className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground space-y-1.5">
              <p><strong>Батиров Камронбек</strong></p>
              <p>ИНН: 631 292 863 &nbsp;|&nbsp; ПИНФЛ: 50607026520010</p>
              <p>тупик Шивли, дом 11, Юнусабадский район, г. Ташкент, Узбекистан, 100084</p>
              <p>E-mail: <a href="mailto:hi@kama.uz" className="underline">hi@kama.uz</a></p>
              <p><a href="https://trek.uz" className="underline">trek.uz</a></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
