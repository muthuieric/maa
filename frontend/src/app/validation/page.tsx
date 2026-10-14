'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { LanguageCode, translations } from '../../lib/translations';
import { CheckCircle2, UploadCloud, RefreshCw, BarChart2, ShieldCheck, FileText, Check } from 'lucide-react';

export default function ValidationPage() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const t = translations[currentLang];

  const [validationReport, setValidationReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [batchJson, setBatchJson] = useState('');
  const [batchStatus, setBatchStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchValidationReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/narratives/validation-report');
      if (res.ok) {
        const data = await res.json();
        setValidationReport(data);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidationReport();
  }, []);

  const handleLoadSampleBatch = () => {
    const sampleBatch = [
      {
        narrative: "Wasichana walilazimishwa na ngariba kufanyiwa mila ya tohara ya wasichana kabla ya kuvuka ungo.",
        language: "Swahili",
        age_band: "18-25",
        gender: "Female",
        sub_county: "Narok North",
        source_org: "Tareto Africa Trust",
        label: "FGM",
        consent_given: true
      },
      {
        narrative: "Entito ena eitasheyie enkaputi o inkishu pee aaku esiankiki to olosho e Kajiado.",
        language: "Maa",
        age_band: "Under 18",
        gender: "Female",
        sub_county: "Kajiado Central",
        source_org: "Tareto Africa Trust",
        label: "Child marriage",
        consent_given: true
      },
      {
        narrative: "Tunapinga ukeketaji na tunalinda haki za watoto na elimu badala ya tohara.",
        language: "Swahili",
        age_band: "26-40",
        gender: "Female",
        sub_county: "Narok South",
        source_org: "Tareto Africa Trust",
        label: "FGM",
        consent_given: true
      },
      {
        narrative: "Eing'uaa sukulu amu eitasheyie esitaany o erikunoto to emuratare.",
        language: "Maa",
        age_band: "Under 18",
        gender: "Female",
        sub_county: "Narok West",
        source_org: "Tareto Africa Trust",
        label: "Child marriage",
        consent_given: true
      }
    ];
    setBatchJson(JSON.stringify(sampleBatch, null, 2));
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBatchStatus(null);
    setUploading(true);

    try {
      const parsed = JSON.parse(batchJson);
      if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array of narratives');

      const res = await fetch('/api/narratives/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_org: "Tareto Africa Trust",
          narratives: parsed
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Failed to import batch');

      setBatchStatus(`Successfully imported ${result.imported_count} narratives (${result.rejected_count} rejected due to missing consent). Report updated.`);
      setValidationReport(result.validation_report);
      setBatchJson('');
    } catch (err: any) {
      setBatchStatus(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const getKappaBadge = (kappa: number) => {
    if (kappa >= 0.75) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (kappa >= 0.50) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  return (
    <>
      <Navbar currentLang={currentLang} onLanguageChange={setCurrentLang} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
              <span>{t.interAnnotatorTitle}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              External validation comparing bilingual NLP predictions against community qualitative data (Tareto Africa Trust)
            </p>
          </div>
          <button
            type="button"
            onClick={fetchValidationReport}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate Agreement</span>
          </button>
        </div>

        {/* High-level KPI Scorecards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.cohensKappa}
            </span>
            <div className="flex items-center space-x-2 pt-1">
              <span className={`text-2xl font-extrabold px-2.5 py-0.5 rounded-lg border ${getKappaBadge(validationReport?.cohens_kappa || 0)}`}>
                {validationReport ? validationReport.cohens_kappa.toFixed(3) : '...'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {validationReport?.kappa_interpretation || 'Evaluating agreement level'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.macroF1}
            </span>
            <div className="text-2xl font-extrabold text-slate-900 pt-1">
              {validationReport ? (validationReport.macro_f1 * 100).toFixed(1) + '%' : '...'}
            </div>
            <p className="text-[11px] text-slate-500">Thesis Target: ≥ 75.0%</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Accuracy
            </span>
            <div className="text-2xl font-extrabold text-slate-900 pt-1">
              {validationReport ? (validationReport.accuracy * 100).toFixed(1) + '%' : '...'}
            </div>
            <p className="text-[11px] text-slate-500">Agreement on ground-truth labels</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Evaluated Corpus Size
            </span>
            <div className="text-2xl font-extrabold text-savanna-800 pt-1">
              {validationReport ? validationReport.total_evaluated : 0}
            </div>
            <p className="text-[11px] text-slate-500">Tareto Africa Trust validated records</p>
          </div>
        </div>

        {/* Detailed Per-Class Performance Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-savanna-800" />
              <span>Per-Category Precision, Recall, and F1-Score</span>
            </h3>
            <span className="text-xs text-slate-400">Harmful Practice Discourse Breakdown</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left font-bold uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left font-bold uppercase tracking-wider">Precision</th>
                  <th className="px-6 py-3 text-left font-bold uppercase tracking-wider">Recall</th>
                  <th className="px-6 py-3 text-left font-bold uppercase tracking-wider">F1-Score</th>
                  <th className="px-6 py-3 text-left font-bold uppercase tracking-wider">Support (Sample Count)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {validationReport?.per_class && Object.entries(validationReport.per_class).map(([cat, metrics]: any) => (
                  <tr key={cat} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{cat}</td>
                    <td className="px-6 py-3.5 font-mono">{(metrics.precision * 100).toFixed(1)}%</td>
                    <td className="px-6 py-3.5 font-mono">{(metrics.recall * 100).toFixed(1)}%</td>
                    <td className="px-6 py-3.5 font-mono font-bold text-savanna-900">{(metrics.f1_score * 100).toFixed(1)}%</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">{metrics.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Batch CBO Dataset Uploader */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-savanna-800" />
                <span>{t.batchUploadTitle}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.batchUploadDesc}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadSampleBatch}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-earth-50 hover:bg-earth-100 text-earth-800 border border-earth-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-earth-600" />
              <span>Load Tareto Field Sample Batch</span>
            </button>
          </div>

          {batchStatus && (
            <div className="p-3.5 bg-savanna-50 border border-savanna-200 rounded-lg text-xs text-savanna-900 font-medium">
              {batchStatus}
            </div>
          )}

          <form onSubmit={handleBatchSubmit} className="space-y-4">
            <textarea
              rows={8}
              value={batchJson}
              onChange={(e) => setBatchJson(e.target.value)}
              placeholder="Paste JSON array containing narrative records with ground-truth annotation labels and consent confirmations..."
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-savanna-800 bg-slate-50"
            />

            <button
              type="submit"
              disabled={uploading || !batchJson.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-savanna-800 hover:bg-savanna-900 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{uploading ? 'Processing Batch Validation...' : 'Import & Compute Cohen\'s Kappa'}</span>
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

