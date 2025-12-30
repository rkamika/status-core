import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "STATUS CORE | Emotional Diagnostic",
  description: "Identify your current emotional and mental state with clarity and precision.",
};

import { ThemeProvider } from "@/components/theme-provider";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang} className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
