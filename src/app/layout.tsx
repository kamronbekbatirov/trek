import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Trek — Налоговый календарь Узбекистана",
    template: "%s | Trek",
  },
  description:
    "Визуальный налоговый календарь для бухгалтеров и предпринимателей Узбекистана. Никогда не пропускайте налоговые дедлайны.",
  keywords: ["налоговый календарь", "Узбекистан", "НДС", "НДФЛ", "бухгалтер", "trek"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Trek — Налоговый календарь Узбекистана",
    description: "Визуальный налоговый календарь для бухгалтеров Узбекистана",
    url: "https://trek.uz",
    siteName: "Trek",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
