"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Locale } from "@/lib/translations";

type TranslationKey = keyof typeof translations["ar"];

type LanguageContextType = {
  locale: Locale;
  setLocale: (lang: Locale) => void;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = (lang: Locale) => {
    setLocaleState(lang);
    // Write cookie
    document.cookie = `deviceflow_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    // Update layout direction immediately
    if (typeof window !== "undefined") {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    // Sync initial mount direction
    if (typeof window !== "undefined") {
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = (key: TranslationKey): string => {
    const dict = translations[locale] || translations["ar"];
    return dict[key] || translations["ar"][key] || key;
  };

  const isRtl = locale === "ar";

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
