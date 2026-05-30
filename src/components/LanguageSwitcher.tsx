"use client";

import { Globe } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { languages } from "@/lib/languages";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{languages.find((l) => l.code === language)?.nativeName}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as any);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors",
                  language === lang.code ? "bg-primary-50 text-primary-700 font-medium" : "text-slate-700"
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{lang.nativeName}</span>
                  <span className="text-xs text-slate-400">{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
