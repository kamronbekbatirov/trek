"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, Crown, AlertCircle, Sparkles } from "lucide-react";
import { MarkdownMessage } from "@/components/ui/markdown-message";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "@/i18n/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UsageInfo {
  used: number;
  limit: number;
}

export function ProChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Привет! Я **Треки** — ваш персональный налоговый помощник с доступом к Налоговому кодексу РУз.\n\nЗадайте любой вопрос о налогах Узбекистана — я помогу разобраться.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/chat/pro")
      .then((r) => {
        if (r.status === 403) { setIsPro(false); return null; }
        setIsPro(true);
        return r.json();
      })
      .then((data) => { if (data) setUsage(data); })
      .catch(() => setIsPro(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }

    try {
      const res = await fetch("/api/chat/pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          query: text,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "LIMIT_REACHED") {
          setError("Вы исчерпали лимит 50 сообщений в этом месяце. Лимит обновится в начале следующего месяца.");
        } else if (data.code === "NOT_PRO") {
          setIsPro(false);
        } else {
          setError(data.error ?? "Ошибка");
        }
        return;
      }

      if (data.message) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      }
      if (data.usage) setUsage(data.usage);
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (isPro === null) {
    return (
      <div className="rounded-2xl border bg-card overflow-hidden flex flex-col" style={{ height: "600px" }}>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isPro === false) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold text-xl mb-2">Треки — функция Pro</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">
          Получите доступ к Треки с базой знаний Налогового кодекса РУз.<br />
          До 50 сообщений в месяц.
        </p>
        <Link href="/billing">
          <Button size="lg" className="gap-2">
            <Crown className="h-4 w-4" />
            Перейти на Pro
          </Button>
        </Link>
      </div>
    );
  }

  const usedPct = usage ? (usage.used / usage.limit) * 100 : 0;
  const remaining = usage ? usage.limit - usage.used : null;
  const isLimitReached = usage ? usage.used >= usage.limit : false;

  return (
    <div className="rounded-2xl border bg-card overflow-hidden flex flex-col shadow-sm" style={{ height: "600px" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b bg-muted/30">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">Треки</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold tracking-wide">PRO</span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">Налоговый кодекс РУз</p>
        </div>
        {usage && (
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground mb-1">
              {remaining} / {usage.limit}
            </p>
            <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usedPct > 80 ? "bg-orange-500" : "bg-primary"}`}
                style={{ width: `${usedPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                  ${m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"}`}
              >
                {m.role === "assistant" ? <MarkdownMessage content={m.content} /> : m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-background/50 p-3">
        {isLimitReached ? (
          <div className="text-center py-2 text-sm text-muted-foreground">
            Лимит 50 сообщений исчерпан. Обновится в начале следующего месяца.
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Спросите о налоговом законодательстве..."
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[40px] max-h-[120px] disabled:opacity-50 transition-shadow"
              style={{ height: "40px" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "40px";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
            />
            <Button
              size="icon"
              onClick={send}
              disabled={!input.trim() || loading}
              className="h-10 w-10 rounded-xl shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
