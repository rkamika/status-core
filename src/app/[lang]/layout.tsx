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
import MetaPixel from "@/components/meta-pixel";
import { Suspense } from "react";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang={lang} className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        {gtmId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        )}
      </head>
      <body className="antialiased bg-background text-foreground transition-colors duration-300">
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
