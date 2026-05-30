"use client";

import { useState } from "react";
import { TEMPLATES, INDUSTRIES } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function TemplatesPage() {
  const { t } = useI18n();
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedStyle, setSelectedStyle] = useState("All");

  const filteredTemplates = TEMPLATES.filter((template) => {
    const industryMatch = selectedIndustry === "All" || template.category === selectedIndustry;
    const styleMatch = selectedStyle === "All" || template.style === selectedStyle;
    return industryMatch && styleMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t.templatesPage.back}</span>
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <h1 className="text-xl font-bold text-slate-900">{t.templatesPage.title}</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-6 border mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t.templatesPage.filterTitle}</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-2">{t.templates.filterIndustry}</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedIndustry("All")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedIndustry === "All" ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {t.industries.all}
                </button>
                {[t.industries.technology, t.industries.finance, t.industries.creative, t.industries.academic].map((industry) => (
                  <button
                    key={industry}
                    onClick={() => setSelectedIndustry(industry)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedIndustry === industry ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-2">{t.templates.filterStyle}</label>
              <div className="flex flex-wrap gap-2">
                {[t.styles.all, t.styles.minimal, t.styles.traditional, t.styles.creative, t.styles.modern, t.styles.classic].map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedStyle === style ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} t={t} />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No templates match your filters</p>
          </div>
        )}
      </main>
    </div>
  );
}

function TemplateCard({ template, t }: { template: any; t: any }) {
  return (
    <div className="bg-white rounded-2xl border overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
      <Link href={`/editor/${template.id}`} className="block">
        <div className="h-56 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
          <div className="w-40 h-52 bg-white rounded shadow-lg p-4 border-l-4 border-primary-500 transition-transform group-hover:scale-105">
            <div className="space-y-1">
              <div className="h-3 bg-slate-200 rounded w-28" />
              <div className="h-2 bg-slate-100 rounded w-20" />
              <div className="h-2 bg-slate-100 rounded w-24 mt-3" />
              <div className="h-1 bg-slate-100 rounded w-20" />
              <div className="h-1 bg-slate-100 rounded w-28" />
              <div className="h-2 bg-slate-100 rounded w-22 mt-3" />
              <div className="h-1 bg-slate-100 rounded w-18" />
              <div className="h-1 bg-slate-100 rounded w-24" />
            </div>
          </div>
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
          {template.free ? (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {t.templates.free}
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-semibold">
              {t.templates.pro}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-4">{template.description}</p>
        <div className="flex items-center gap-2">
          <Link
            href={`/editor/${template.id}`}
            className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg text-center font-medium hover:bg-primary-700 transition-colors"
          >
            {t.templates.useTemplate}
          </Link>
        </div>
      </div>
    </div>
  );
}
