"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { MarkdownMessage } from "@/components/ui/markdown-message";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TrekiChatProps {
  currentStep?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentState?: any;
}

export function TrekiChat({ currentStep, currentState }: TrekiChatProps) {
  const t = useTranslations("onboarding");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Update welcome message when locale/step changes
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: t("treki_welcome", { step: currentStep ?? 1 }),
      },
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          currentStep,
          currentState,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("treki_error") },
      ]);
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

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg font-medium text-sm transition-all
          bg-primary text-primary-foreground hover:opacity-90 active:scale-95
          ${open ? "hidden" : "flex"}`}
      >
        <MessageCircle className="h-4 w-4" />
        {t("treki_ask")}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 left-6 z-50 w-[340px] max-w-[calc(100vw-24px)] rounded-2xl border bg-card shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "480px" }}>
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b bg-primary text-primary-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/20">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">{t("treki_name")}</p>
              <p className="text-[10px] opacity-70 mt-0.5">{t("treki_subtitle")}</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ maxHeight: "300px" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                    ${m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"}`}
                >
                  {m.role === "assistant" ? <MarkdownMessage content={m.content} /> : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t flex items-end gap-2 p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={t("treki_placeholder")}
              rows={1}
              className="flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[38px] max-h-[100px]"
              style={{ height: "38px" }}
              onInput={(e) => {
                const target = e.currentTarget;
                target.style.height = "38px";
                target.style.height = Math.min(target.scrollHeight, 100) + "px";
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
