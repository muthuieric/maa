'use client';

import React from 'react';
import { LanguageCode } from '../lib/translations';

interface Props {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const LanguageSwitcher: React.FC<Props> = ({ currentLang, onLanguageChange }) => {
  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
    { code: 'maa', label: 'Maa', native: 'Maa' },
  ];

  return (
    <div className="flex items-center space-x-1 bg-white/90 backdrop-blur border border-slate-200 rounded-lg p-1 shadow-sm">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onLanguageChange(lang.code)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            currentLang === lang.code
              ? 'bg-savanna-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title={lang.native}
        >
          {lang.native}
        </button>
      ))}
    </div>
  );
};

