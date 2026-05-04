import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { searchTaxCode } from "@/lib/tax-code-search";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const STEP_DESCRIPTIONS: Record<number, string> = {
  1: "Шаг 1: Приветствие. Пользователь видит форму для ввода имени и кнопку 'Начать'. Помоги с общими вопросами о Trek.",
  2: "Шаг 2: Выбор типа организации (ООО/АО, ИП, Самозанятый, Дехканское хозяйство, Бухгалтер). Помоги определить правильный тип.",
  3: "Шаг 3: Выбор налогового режима (НДС или НсО). Помоги понять разницу: НДС — оборот >1 млрд сум, НсО — до 1 млрд сум.",
  4: "Шаг 4: Наёмные сотрудники. Объясни, что это влияет на зарплатные налоги: НДФЛ, соцналог, ИНПС (до 15-го числа каждого месяца). ИП: соцналог ≥1 БРВ обязателен даже без сотрудников (ст.408 НК).",
  5: "Шаг 5: Имущество и земля. Помоги понять: налог на имущество (ст.417 НК), земельный налог (ст.432 НК), водный налог (ст.448 НК).",
  6: "Шаг 6: Специфичная деятельность (дивиденды, КИК, акцизы и т.д.). Большинству организаций ничего выбирать не нужно.",
  7: "Шаг 7: Пенсионный фонд — только для организаций с работниками в особых случаях (ПКМ №661).",
  8: "Шаг 8: Напоминания и выбор языка. Пользователь настраивает уведомления.",
  9: "Шаг 9: Итоговый экран. Пользователь видит сводку настроек и предложение перейти на Pro.",
};

const BASE_SYSTEM_PROMPT = `Ты — Трэки, дружелюбный налоговый помощник сервиса Trek для Узбекистана.
Помогаешь пользователям настроить персональный налоговый календарь во время регистрации.

Правила:
- Отвечай кратко (2-4 предложения максимум для простых вопросов).
- Ссылайся на конкретные статьи Налогового кодекса РУз (НК) когда уместно.
- Отвечай на том языке, на котором задан вопрос (русский, узбекский или английский).
- Если не знаешь — честно скажи и посоветуй обратиться к бухгалтеру.
- Используй markdown: **жирный** для важного, - для списков.

ТИПЫ ОРГАНИЗАЦИЙ:
- LLC/JSC: Юрлицо (ООО, АО). Полный набор налогов. НДС или НсО.
- IE: ИП. Как юрлицо, но без годовой финотчётности НСБУ. Обязателен соцналог ≥1 БРВ/мес (ст.408 НК).
- SELF_EMPLOYED: Самозанятый. Только налог с оборота (ст.465 НК) и добровольный соцналог. Без НДС, без имущества.
- FARM: Дехкан. Земельный + водный налог. НДФЛ/соцналог только с сотрудниками.
- ACCOUNTANT: Бухгалтер — видит все события для ведения нескольких клиентов.

НАЛОГОВЫЕ РЕЖИМЫ:
- НДС (VAT): оборот >1 млрд сум или добровольно. НДС 12% + налог на прибыль.
- НсО (TURNOVER): оборот до 1 млрд сум. 4% (или 1% для торговли) вместо НДС+прибыль.

КЛЮЧЕВЫЕ СРОКИ:
- 15-е: НДФЛ, соцналог, ИНПС (за сотрудников), налог с оборота
- 20-е: НДС (за прошлый месяц), налог на прибыль (квартально)
- 10-е: авансы по имуществу и земле (ежемесячно при НДС), акцизы
`;

export async function POST(req: NextRequest) {
  try {
    const { messages, currentStep, currentState } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Build step-specific context
    const stepDesc = currentStep ? STEP_DESCRIPTIONS[currentStep] ?? "" : "";
    const stateContext = currentState
      ? `\nТекущий выбор пользователя: ${JSON.stringify(currentState)}`
      : "";

    // Search tax code for relevant sections based on last user message
    const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").slice(-1)[0]?.content ?? "";
    const taxCodeContext = lastUserMsg ? searchTaxCode(lastUserMsg, 3) : "";

    const systemPrompt = BASE_SYSTEM_PROMPT
      + (stepDesc ? `\n\nКОНТЕКСТ ТЕКУЩЕГО ЭКРАНА:\n${stepDesc}` : "")
      + stateContext
      + (taxCodeContext ? `\n\nРЕЛЕВАНТНЫЕ СТАТЬИ НК РУЗ:\n${taxCodeContext}` : "");

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: systemPrompt,
      messages: messages.slice(-10),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ message: text });
  } catch (err) {
    console.error("Onboarding chat error:", err);
    return NextResponse.json({ error: "Ошибка чата" }, { status: 500 });
  }
}
