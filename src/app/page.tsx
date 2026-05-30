"use client";

import { useState } from "react";
import {
  FileText,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TEMPLATES, INDUSTRIES, RESUME_TIPS } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function HomePage() {
  const { t } = useI18n();
  const [selectedIndustry, setSelectedIndustry] = useState("科技");

  const filteredTemplates = TEMPLATES.filter(
    (t) => t.industry === selectedIndustry || selectedIndustry === "全部"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900">ATSResumePro</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <LanguageSwitcher />
            <Link href="#features" className="text-slate-600 hover:text-slate-900 font-medium">{t.nav.features}</Link>
            <Link href="#templates" className="text-slate-600 hover:text-slate-900 font-medium">{t.nav.templates}</Link>
            <Link href="/templates" className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors">
              {t.nav.getStarted}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4" />
                {t.hero.badge}
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                {t.hero.title}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                  {" "}
                  {t.hero.titleHighlight}
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-md">
                {t.hero.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/templates" className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all flex items-center gap-2">
                  {t.hero.createResume}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#features" className="bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg border hover:bg-slate-50 transition-all">
                  {t.hero.learnMore}
                </Link>
              </div>
              <div className="flex items-center gap-8 mt-10">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">
                      {i === 4 && "+2k"}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-slate-600">{t.hero.trustedBy}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-xl border p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                    JD
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">Jane Doe</div>
                    <div className="text-sm text-slate-500">Senior Software Engineer</div>
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    ATS Score: 95%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-slate-500 mb-1">Keywords Matched</div>
                    <div className="font-bold text-slate-900">14/15</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-slate-500 mb-1">Format Check</div>
                    <div className="font-bold text-green-600">Perfect</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t.features.title}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Layers className="w-8 h-8" />}
              title={t.features.professionalTemplates.title}
              description={t.features.professionalTemplates.description}
            />
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8" />}
              title={t.features.atsOptimization.title}
              description={t.features.atsOptimization.description}
            />
            <FeatureCard
              icon={<Download className="w-8 h-8" />}
              title={t.features.stableExports.title}
              description={t.features.stableExports.description}
            />
          </div>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.features.featureList.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-700 bg-slate-50 px-4 py-3 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t.templates.title}
            </h2>
            <p className="text-lg text-slate-600">{t.templates.subtitle}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedIndustry("全部")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedIndustry === "全部"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.industries.all}
            </button>
            {[t.industries.technology, t.industries.finance, t.industries.creative, t.industries.academic].map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedIndustry === industry
                    ? "bg-primary-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {industry}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t.tips.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {t.tips.items.map((tip, i) => (
              <div key={i} className="bg-white/10 backdrop-blur text-white p-4 rounded-xl text-left">
                <span className="text-primary-300 font-bold mr-2">💡</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            {t.cta.title}
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            {t.cta.subtitle}
          </p>
          <Link href="/templates" className="inline-block bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all">
            {t.cta.button}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              <span className="text-lg font-bold">ATSResumePro</span>
            </div>
            <div className="text-sm text-slate-400">
              {t.footer.copyright}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="bg-slate-50 p-8 rounded-2xl border hover:shadow-lg transition-shadow">
      <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function TemplateCard({ template, t }: { template: any; t: any }) {
  return (
    <Link href={`/editor/${template.id}`} className="block">
      <div className="bg-white rounded-2xl border-2 hover:border-primary-500 transition-all overflow-hidden group cursor-pointer">
        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <div className="w-32 h-44 bg-white rounded shadow-lg p-3 border-l-4 border-primary-500">
            <div className="space-y-1">
              <div className="h-2 bg-slate-200 rounded w-24" />
              <div className="h-1 bg-slate-100 rounded w-16" />
              <div className="h-1 bg-slate-100 rounded w-20 mt-2" />
              <div className="h-1 bg-slate-100 rounded w-18" />
              <div className="h-1 bg-slate-100 rounded w-22" />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">{template.name}</h3>
            {template.free ? (
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">{t.templates.free}</span>
            ) : (
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-semibold">{t.templates.pro}</span>
            )}
          </div>
          <p className="text-sm text-slate-500">{template.description}</p>
          <div className="mt-4 flex items-center text-primary-600 font-medium text-sm">
            {t.templates.useTemplate}
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
