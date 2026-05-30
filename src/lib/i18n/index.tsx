"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { en } from "./en";
import { zh } from "./zh";
import { fr } from "./fr";
import { ru } from "./ru";
import { Language } from "../languages";

const translations = { en, zh, fr, ru };

type TranslationKeys = typeof en;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [t, setT] = useState<TranslationKeys>(en);

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
      setT(translations[savedLang]);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    setT(translations[lang]);
    localStorage.setItem("language", lang);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
