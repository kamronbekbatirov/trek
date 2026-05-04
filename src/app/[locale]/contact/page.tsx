"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement actual email sending via API
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={null} />
      <main className="container mx-auto px-4 max-w-2xl py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 mb-12">
          <a href="mailto:hello@trek.uz" className="flex items-start gap-3 p-5 rounded-xl border bg-card hover:border-foreground/30 transition-colors">
            <div className="h-10 w-10 rounded-lg border flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold mb-0.5">Email</p>
              <p className="text-sm text-muted-foreground">hello@trek.uz</p>
            </div>
          </a>

          <a href="https://t.me/trekuz" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-5 rounded-xl border bg-card hover:border-foreground/30 transition-colors">
            <div className="h-10 w-10 rounded-lg border flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold mb-0.5">Telegram</p>
              <p className="text-sm text-muted-foreground">@trekuz</p>
            </div>
          </a>
        </div>

        {sent ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-foreground/70" />
            <h2 className="text-xl font-semibold mb-2">{t("success_title")}</h2>
            <p className="text-muted-foreground text-sm">{t("success_desc")}</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-7">
            <h2 className="font-semibold text-lg mb-5">{t("form_title")}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t("name_label")}</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("name_placeholder")} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">{t("message_label")}</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("message_placeholder")}
                  required
                  rows={5}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <Button type="submit" className="gap-2">
                <Send className="h-4 w-4" />
                {t("send")}
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
