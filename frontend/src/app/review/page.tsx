'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { LanguageCode, translations } from '../../lib/translations';

export default function ReviewPage() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const t = translations[currentLang];

  return (
    <>
      <Navbar currentLang={currentLang} onLanguageChange={setCurrentLang} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <section className="bg-savanna-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Review
            </h1>
            <p className="text-sm sm:text-base text-savanna-200 leading-relaxed">
              Map, validation, archive, export.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
          <a href="/map" className="block border border-slate-200 rounded-xl p-8 text-left hover:bg-slate-50 hover:border-savanna-400 transition-colors">
            <h3 className="font-bold text-slate-900 mb-2">Map</h3>
            <p className="text-sm text-slate-600">View narrative locations on the map.</p>
          </a>
          <a href="/validation" className="block border border-slate-200 rounded-xl p-8 text-left hover:bg-slate-50 hover:border-savanna-400 transition-colors">
            <h3 className="font-bold text-slate-900 mb-2">Validation</h3>
            <p className="text-sm text-slate-600">Validate submitted narratives.</p>
          </a>
          <a href="/archive" className="block border border-slate-200 rounded-xl p-8 text-left hover:bg-slate-50 hover:border-savanna-400 transition-colors">
            <h3 className="font-bold text-slate-900 mb-2">Archive</h3>
            <p className="text-sm text-slate-600">Browse the narrative archive.</p>
          </a>
          <a href="/export" className="block border border-slate-200 rounded-xl p-8 text-left hover:bg-slate-50 hover:border-savanna-400 transition-colors">
            <h3 className="font-bold text-slate-900 mb-2">Export</h3>
            <p className="text-sm text-slate-600">Export data for reporting.</p>
          </a>
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