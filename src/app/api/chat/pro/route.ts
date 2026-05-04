import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";
import { searchTaxCode } from "@/lib/tax-code-search";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PRO_MONTHLY_LIMIT = 50;

const SYSTEM_PROMPT = `Ты — Трэки Pro, профессиональный налоговый ИИ-помощник сервиса Trek для Узбекистана.
Ты помогаешь Pro-пользователям разбираться в налоговом законодательстве Республики Узбекистан.

Отвечай точно, ссылайся на конкретные статьи Налогового кодекса когда возможно.
Если вопрос не связан с налогами Узбекистана — вежливо перенаправь на налоговую тематику.
Отвечай на том языке, на котором задан вопрос (русский, узбекский или английский).
Будь конкретным и практичным. Не давай юридических советов — только информацию.`;

export async function POST(req: NextRequest) {
  // Auth check
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pro subscription check
  const sub = await prisma.subscription.findUnique({
    where: { userId: session.userId },
    select: { plan: true, status: true },
  });
  if (!sub || sub.plan !== "PRO" || sub.status !== "ACTIVE") {
    return NextResponse.json({ error: "Pro required", code: "NOT_PRO" }, { status: 403 });
  }

  // Monthly usage check
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const usage = await prisma.aiChatUsage.findUnique({
    where: { userId_year_month: { userId: session.userId, year, month } },
  });

  const currentCount = usage?.count ?? 0;
  if (currentCount >= PRO_MONTHLY_LIMIT) {
    return NextResponse.json(
      { error: `Достигнут лимит ${PRO_MONTHLY_LIMIT} сообщений в месяц`, code: "LIMIT_REACHED" },
      { status: 429 }
    );
  }

  const { messages, query } = await req.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Retrieve relevant tax code sections
  const lastUserMsg = query || messages.filter((m: { role: string }) => m.role === "user").slice(-1)[0]?.content || "";
  const taxCodeContext = searchTaxCode(lastUserMsg, 6);

  const systemWithContext = SYSTEM_PROMPT +
    (taxCodeContext
      ? `\n\nРЕЛЕВАНТНЫЕ СТАТЬИ НАЛОГОВОГО КОДЕКСА РУЗ:\n${taxCodeContext}`
      : "");

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemWithContext,
      messages: messages.slice(-20), // last 20 messages
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Increment usage counter
    await prisma.aiChatUsage.upsert({
      where: { userId_year_month: { userId: session.userId, year, month } },
      update: { count: { increment: 1 } },
      create: { userId: session.userId, year, month, count: 1 },
    });

    return NextResponse.json({
      message: text,
      usage: { used: currentCount + 1, limit: PRO_MONTHLY_LIMIT },
    });
  } catch (err) {
    console.error("Pro chat error:", err);
    return NextResponse.json({ error: "Ошибка чата" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pro subscription check
  const sub = await prisma.subscription.findUnique({
    where: { userId: session.userId },
    select: { plan: true, status: true },
  });
  if (!sub || sub.plan !== "PRO" || sub.status !== "ACTIVE") {
    return NextResponse.json({ error: "Pro required", code: "NOT_PRO" }, { status: 403 });
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const usage = await prisma.aiChatUsage.findUnique({
    where: { userId_year_month: { userId: session.userId, year, month } },
  });

  return NextResponse.json({
    used: usage?.count ?? 0,
    limit: PRO_MONTHLY_LIMIT,
  });
}
