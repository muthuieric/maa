'use client';
import React, { useEffect, useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';

import { LanguageCode } from '../lib/translations';

type Lang = 'en' | 'sw' | 'maa';
interface Props { currentLang: LanguageCode | Lang; }

const API_BASE = 'http://localhost:8000';
const TITLES: Record<string, string> = {
  en: 'English to Maasai Translator (AI)',
  sw: 'Mkalimani wa AI: Kiingereza kwenda Maa',
  maa: 'Engilisha to Maa (AI)',
};
const BTNS: Record<string, string> = {
  en: 'Translate to Maasai',
  sw: 'Tafsiri kwa Maa',
  maa: 'Ibelakinoto Maa',
};

export function TranslatorCard(props: Props) {
  const currentLang: string = props.currentLang;
  const title = TITLES[currentLang] || TITLES.en;
  const btnLabel = BTNS[currentLang] || BTNS.en;
  const [input, setInput] = useState('We must protect girls from harmful practices.');
  const [statusText, setStatusText] = useState('Checking backend...');
  const [statusOk, setStatusOk] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(API_BASE + '/api/translate/status')
      .then(function (r) { return r.text(); })
      .then(function (txt) {
        if (cancelled) return;
        try {
          const data = JSON.parse(txt);
          if (data && data.available) {
            setStatusOk(true);
            setStatusText('Ready — ' + String(data.adapter_model || 'model loaded'));
          } else {
            setStatusOk(false);
            setStatusText('Not ready: ' + String((data && data.reason) || 'unavailable'));
          }
        } catch (e) {
          setStatusOk(false);
          setStatusText('Backend unreachable at ' + API_BASE);
        }
      })
      .catch(function () {
        if (!cancelled) {
          setStatusOk(false);
          setStatusText('Backend unreachable at ' + API_BASE);
        }
      });
    return function () { cancelled = true; };
  }, []);

  function run() {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult('');
    fetch(API_BASE + '/api/translate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input.trim() }),
    })
      .then(function (res) {
        return res.text().then(function (txt) {
          let data = null;
          try {
            data = JSON.parse(txt);
          } catch (e) {
            throw new Error('HTTP ' + res.status + ': ' + txt.slice(0, 200));
          }
          if (!res.ok) {
            const detail = data && data.detail ? String(data.detail) : JSON.stringify(data);
            throw new Error('HTTP ' + res.status + ': ' + detail.slice(0, 400));
          }
          return data;
        });
      })
      .then(function (data) {
        if (data && data.translated_text) {
          setResult(String(data.translated_text));
        } else {
          setError('Backend returned no translated_text');
        }
        setLoading(false);
      })
      .catch(function (e) {
        setError(e && e.message ? e.message : 'Request failed');
        setLoading(false);
      });
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
     
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">NLLB-200 plus LoRA eng_Latn to mas_Latn</p>
        </div>
      </div>
      <div className={statusOk ? 'text-xs rounded-lg px-3 py-2 border bg-green-50 border-green-200 text-green-800' : 'text-xs rounded-lg px-3 py-2 border bg-amber-50 border-amber-200 text-amber-800'}>
        <span>{statusText}</span>
      </div>
      <textarea value={input} onChange={function (e) { setInput(e.target.value); }} rows={3} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-savanna-800" />
      <button onClick={run} disabled={loading || !input.trim()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-savanna-800 hover:bg-savanna-900 disabled:opacity-50 text-white rounded-lg text-sm font-semibold">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        <span>{loading ? 'Translating...' : btnLabel}</span>
      </button>
      {result ? (
        <div className="bg-savanna-50 border border-savanna-200 rounded-lg p-4 space-y-1">
          <p className="text-xs font-semibold text-savanna-800">Maasai (mas_Latn) — review by Maa speaker recommended</p>
          <p className="text-base text-slate-900">{result}</p>
          <p className="text-[11px] text-slate-500">License cc-by-nc-4.0 non-commercial only</p>
        </div>
      ) : null}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
          <p className="font-semibold">Backend says:</p>
          <p>{error}</p>
        </div>
      ) : null}
    </section>
  );
}
