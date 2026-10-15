'use client';

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { useRole } from '../lib/role';
import { LanguageCode, translations } from '../lib/translations';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const t = translations[currentLang];
  const { role, setRole } = useRole();
  const router = useRouter();

  return (
    <>
      <Navbar currentLang={currentLang} onLanguageChange={setCurrentLang} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <section className="bg-savanna-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.appTitle}
            </h1>
            <p className="text-sm sm:text-base text-savanna-200 leading-relaxed">
              Choose your role to continue.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button
            onClick={() => { setRole('collect'); router.push('/collect'); }}
            className="border border-slate-200 rounded-xl p-8 text-left hover:bg-slate-50 hover:border-savanna-400 transition-colors"
          >
            <h3 className="font-bold text-slate-900 mb-2">Collect Data</h3>
            <p className="text-sm text-slate-600">Record and submit community narratives.</p>
          </button>
          <button
            onClick={() => { setRole('translate'); router.push('/translate'); }}
            className="border border-slate-200 rounded-xl p-8 text-left hover:bg-slate-50 hover:border-savanna-400 transition-colors"
          >
            <h3 className="font-bold text-slate-900 mb-2">Translate</h3>
            <p className="text-sm text-slate-600">English to Maasai AI translation.</p>
          </button>
          <button
            onClick={() => { setRole('review'); router.push('/review'); }}
            className="border border-slate-200 rounded-xl p-8 text-left hover:bg-slate-50 hover:border-savanna-400 transition-colors"
          >
            <h3 className="font-bold text-slate-900 mb-2">Review</h3>
            <p className="text-sm text-slate-600">Map, validation, archive, export.</p>
          </button>
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

