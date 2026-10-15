'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { TranslatorCard } from '../../components/TranslatorCard';
import { LanguageCode, translations } from '../../lib/translations';

export default function TranslatePage() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const t = translations[currentLang];

  return (
    <>
      <Navbar currentLang={currentLang} onLanguageChange={setCurrentLang} />

      <main className="flex-1 min-h-screen px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex flex-col items-center">
        <section className="bg-savanna-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden w-full max-w-2xl">
          <div className="relative z-10 space-y-3 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Translate
            </h1>
            <p className="text-sm sm:text-base text-savanna-200 leading-relaxed">
              English to Maasai AI translation.
            </p>
          </div>
        </section>

        <section className="w-full max-w-lg">
          <TranslatorCard currentLang={currentLang} />
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            {t.appTitle} — Community Narrative Monitor
          </p>
          <p>
            Field Partner Validation: Tareto Africa Trust • Guided by Ubuntu Data Ethics & African NLP Principles
          </p>
        </div>
      </footer>
    </>
  );
}