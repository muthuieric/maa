'use client';

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { NarrativeForm } from '../components/NarrativeForm';
import { LanguageCode, translations } from '../lib/translations';
import { BookOpen, ShieldCheck, Cpu, Globe2 } from 'lucide-react';

export default function HomePage() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const t = translations[currentLang];

  return (
    <>
      <Navbar currentLang={currentLang} onLanguageChange={setCurrentLang} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Practical Field Banner */}
        <section className="bg-savanna-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur text-savanna-100">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Narok & Kajiado Counties • Field Narrative Monitor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.appTitle}
            </h1>
            <p className="text-sm sm:text-base text-savanna-200 leading-relaxed">
              Record, transcribe, and analyze community narratives in Swahili and Maa to detect early warning signals of FGM and child marriage, identify discourse stance, and coordinate rapid response with local community monitors.
            </p>
          </div>
        </section>

        {/* Narrative Entry Form Component */}
        <section>
          <NarrativeForm currentLang={currentLang} />
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

