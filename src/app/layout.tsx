import type { Metadata } from "next";
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
      <body className="h-full flex overflow-hidden bg-gray-50">
        <LanguageProvider initialLocale={initialLocale}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
