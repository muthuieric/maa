'use client';

import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { LanguageCode, translations } from '../lib/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
}

export const ConsentModal: React.FC<Props> = ({ isOpen, onClose, currentLang }) => {
  if (!isOpen) return null;
  const t = translations[currentLang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-savanna-800">
            <h3 className="font-semibold text-slate-900 text-base">{t.consentModalTitle}</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>{t.consentModalBody}</p>
          <div className="bg-savanna-50 border border-savanna-200 rounded-lg p-3 text-xs text-savanna-900 space-y-1.5">
            <div className="font-semibold text-slate-800">Guiding Ethical Safeguards:</div>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Pseudonymisation:</strong> Narratives are indexed solely by unique UUIDs; names, phone numbers, and physical addresses are strictly excluded.</li>
              <li><strong>Data Sovereignty:</strong> Contributing CBOs retain governance and right of withdrawal for community data.</li>
              <li><strong>Dual-Store Isolation:</strong> Narrative content (NoSQL) and administrative metadata (SQL) are structurally separated.</li>
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-savanna-800 hover:bg-savanna-900 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

