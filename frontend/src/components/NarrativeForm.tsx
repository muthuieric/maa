import React, { useState } from 'react';
import { Send, Shield, Info, CheckCircle2, AlertCircle, Mic } from 'lucide-react';
import { LanguageCode, translations } from '../lib/translations';
import { saveOfflineNarrative } from '../lib/offlineStorage';
import { ConsentModal } from './ConsentModal';
import { PredictionResultCard, AnalysisData } from './PredictionResultCard';
import { AudioRecorder } from './AudioRecorder';

interface Props {
  currentLang: LanguageCode;
  onSubmissionSuccess?: () => void;
}

export const NarrativeForm: React.FC<Props> = ({ currentLang, onSubmissionSuccess }) => {
  const t = translations[currentLang];

  const [narrative, setNarrative] = useState('');
  const [language, setLanguage] = useState<'Swahili' | 'Maa'>('Swahili');
  const [ageBand, setAgeBand] = useState('18-25');
  const [gender, setGender] = useState('Female');
  const [subCounty, setSubCounty] = useState('Narok South');
  const [sourceOrg, setSourceOrg] = useState('Tareto Africa Trust');
  const [label, setLabel] = useState('FGM');
  const [consentGiven, setConsentGiven] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'offline'; text: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  const subCounties = [
    'Narok North',
    'Narok South',
    'Narok East',
    'Narok West',
    'Trans Mara West',
    'Trans Mara East',
    'Kajiado Central',
    'Kajiado North',
    'Kajiado South',
    'Kajiado East',
    'Kajiado West',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!consentGiven) {
      setMessage({
        type: 'error',
        text: 'Informed consent confirmation is mandatory. Please check the consent verification box before submitting.'
      });
      return;
    }

    setLoading(true);
    const payload = {
      narrative,
      language,
      age_band: ageBand,
      gender,
      sub_county: subCounty,
      source_org: sourceOrg,
      label,
      consent_given: consentGiven
    };

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (!isOnline) {
      // Save directly to IndexedDB offline queue
      try {
        await saveOfflineNarrative(payload);
        setMessage({
          type: 'offline',
          text: 'Device is offline. Narrative has been safely encrypted and cached locally in IndexedDB. It will automatically synchronize when connectivity is restored.'
        });
        setNarrative('');
        setConsentGiven(false);
        if (onSubmissionSuccess) onSubmissionSuccess();
      } catch (err: any) {
        setMessage({
          type: 'error',
          text: `Offline storage error: ${err.message || 'Could not access IndexedDB'}`
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const response = await fetch('/api/narratives/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to submit narrative');
      }

      setAnalysisResult(data.analysis);
      setMessage({
        type: 'success',
        text: `Submission stored successfully! Narrative ID: ${data.narrative_id.slice(0, 8)}...`
      });
      setNarrative('');
      setConsentGiven(false);
      if (onSubmissionSuccess) onSubmissionSuccess();
    } catch (err: any) {
      // Fallback: If network request failed unexpectedly, cache offline
      try {
        await saveOfflineNarrative(payload);
        setMessage({
          type: 'offline',
          text: 'Server connection unreachable. Narrative cached locally in IndexedDB and queued for synchronization.'
        });
        setNarrative('');
        setConsentGiven(false);
        if (onSubmissionSuccess) onSubmissionSuccess();
      } catch {
        setMessage({
          type: 'error',
          text: err.message || 'Submission error occurred.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.navEntry}</h2>
            <p className="text-xs text-slate-500">
              Bilingual collection for Swahili and Maa community narratives (Narok & Kajiado)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsConsentModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs text-savanna-800 hover:text-savanna-900 font-semibold bg-savanna-50 border border-savanna-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-savanna-800" />
            <span>Ethical Safeguards</span>
          </button>
        </div>

        {/* Status Message Alert */}
        {message && (
          <div
            className={`p-4 rounded-lg text-sm flex items-start space-x-2.5 border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : message.type === 'offline'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>{message.text}</div>
          </div>
        )}

        {/* Narrative Textarea with Audio Recording Options */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="narrative" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {t.narrativeLabel} <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowAudioRecorder((prev) => !prev)}
              className="inline-flex items-center space-x-1 text-xs text-earth-700 hover:text-earth-900 font-semibold px-2.5 py-1 rounded-md bg-earth-50 border border-earth-200 transition-colors"
            >
              <Mic className="w-3.5 h-3.5 text-earth-600" />
              <span>{showAudioRecorder ? 'Close Audio Capture' : t.recordAudio}</span>
            </button>
          </div>

          {showAudioRecorder && (
            <div className="pb-2">
              <AudioRecorder
                currentLang={currentLang}
                selectedLanguage={language}
                onTranscriptionComplete={(text) => {
                  setNarrative((prev) => prev ? `${prev}\n${text}` : text);
                }}
              />
            </div>
          )}

          <textarea
            id="narrative"
            rows={5}
            required
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder={t.narrativePlaceholder}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-savanna-800 focus:border-transparent transition-all placeholder:text-slate-400"
          />
          <p className="text-[11px] text-slate-400 flex items-center space-x-1">
            <Info className="w-3 h-3" />
            <span>Supports verbatim field transcriptions, interviews, and community story dialogues.</span>
          </p>
        </div>

        {/* Grid Inputs for Language and Demographics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Language Selection */}
          <div className="space-y-1">
            <label htmlFor="language" className="block text-xs font-semibold text-slate-700">
              {t.langSelectLabel}
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'Swahili' | 'Maa')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-savanna-800"
            >
              <option value="Swahili">Swahili (Kiswahili)</option>
              <option value="Maa">Maa (Southern Nilotic)</option>
            </select>
          </div>

          {/* Age Band */}
          <div className="space-y-1">
            <label htmlFor="ageBand" className="block text-xs font-semibold text-slate-700">
              {t.ageBandLabel}
            </label>
            <select
              id="ageBand"
              value={ageBand}
              onChange={(e) => setAgeBand(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-savanna-800"
            >
              <option value="Under 18">Under 18 (Girl-Child / Minor)</option>
              <option value="18-25">18 - 25 (Young Adult)</option>
              <option value="26-40">26 - 40 (Adult)</option>
              <option value="Over 40">Over 40 (Elder / Community Lead)</option>
            </select>
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label htmlFor="gender" className="block text-xs font-semibold text-slate-700">
              {t.genderLabel}
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-savanna-800"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other / Non-disclosed</option>
            </select>
          </div>

          {/* Sub-County */}
          <div className="space-y-1">
            <label htmlFor="subCounty" className="block text-xs font-semibold text-slate-700">
              {t.subCountyLabel}
            </label>
            <select
              id="subCounty"
              value={subCounty}
              onChange={(e) => setSubCounty(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-savanna-800"
            >
              {subCounties.map((sc) => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>

          {/* Source Organisation */}
          <div className="space-y-1">
            <label htmlFor="sourceOrg" className="block text-xs font-semibold text-slate-700">
              {t.sourceOrgLabel}
            </label>
            <input
              type="text"
              id="sourceOrg"
              required
              value={sourceOrg}
              onChange={(e) => setSourceOrg(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-savanna-800"
            />
          </div>

          {/* Annotation Label */}
          <div className="space-y-1">
            <label htmlFor="label" className="block text-xs font-semibold text-slate-700">
              {t.annotationLabel}
            </label>
            <select
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-savanna-800"
            >
              <option value="FGM">FGM (Ukeketaji / Emuratare)</option>
              <option value="Child marriage">Child Marriage (Esiankiki / Ndoa za mapema)</option>
              <option value="Other">Other Harmful Cultural Norm</option>
              <option value="None">None (Benign / Non-harmful)</option>
            </select>
          </div>
        </div>

        {/* Mandatory Informed Consent Checkbox */}
        <div className="p-4 bg-savanna-50 border border-savanna-200 rounded-lg">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent"
              required
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 w-4 h-4 text-savanna-800 rounded border-slate-300 focus:ring-savanna-800"
            />
            <span className="text-xs text-slate-700 leading-relaxed font-medium">
              {t.consentConfirm}{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsConsentModalOpen(true);
                }}
                className="text-savanna-800 underline hover:text-savanna-900 ml-1 font-semibold"
              >
                Read Ubuntu Consent Protocol
              </button>
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !consentGiven}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-savanna-800 hover:bg-savanna-900 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          {loading ? (
            <span>{t.submittingBtn}</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{t.submitBtn}</span>
            </>
          )}
        </button>
      </form>

      {/* Analysis Result Card with XAI Highlighter */}
      <PredictionResultCard analysis={analysisResult} narrativeText={narrative} currentLang={currentLang} />

      {/* Consent Modal */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        currentLang={currentLang}
      />
    </div>
  );
};

