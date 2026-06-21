import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/layout/LanguageContext";
import { Locale } from "@/lib/translations";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "عاصمة المجد - نظام إدارة الأجهزة والمستودع",
  description: "نظام لإدارة استلام وفحص الأجهزة والمستودع المخفّض",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "المجد",
  },
  icons: {
    apple: "/globe.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLocale = (cookieStore.get("deviceflow_lang")?.value as Locale) || "ar";

  return (
    <html lang={initialLocale} dir={initialLocale === "ar" ? "rtl" : "ltr"} className={`${cairo.variable} font-sans h-full bg-gray-50`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full flex overflow-hidden bg-gray-50 selection:bg-indigo-500 selection:text-white">
        <LanguageProvider initialLocale={initialLocale}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
