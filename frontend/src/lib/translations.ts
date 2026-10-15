export type LanguageCode = 'en' | 'sw' | 'maa';

export interface Translations {
  appTitle: string;
  subtitle: string;
  navEntry: string;
  navMap: string;
  navAnalytics: string;
  navValidation: string;
  navBenchmark: string;
  navArchive: string;
  navEthics: string;
  navExport: string;
  navLexicon: string;
  navReport: string;
  navSlides: string;
  navEntryShort: string;
  navMapShort: string;
  navValidationShort: string;
  navArchiveShort: string;
  navExportShort: string;
  narrativeLabel: string;
  narrativePlaceholder: string;
  langSelectLabel: string;
  ageBandLabel: string;
  genderLabel: string;
  subCountyLabel: string;
  sourceOrgLabel: string;
  annotationLabel: string;
  consentConfirm: string;
  consentModalTitle: string;
  consentModalBody: string;
  submitBtn: string;
  submittingBtn: string;
  statusOnline: string;
  statusOffline: string;
  syncingQueue: string;
  queueCount: string;
  analysisTitle: string;
  predictedCategory: string;
  confidenceScore: string;
  discourseStance: string;
  markersDetected: string;
  culturalNotes: string;
  exportTitle: string;
  exportDesc: string;
  downloadCsv: string;
  downloadJson: string;
  recordAudio: string;
  stopRecording: string;
  recordingActive: string;
  audioPreview: string;
  transcribingAudio: string;
  xaiTitle: string;
  xaiExplanation: string;
  cohensKappa: string;
  macroF1: string;
  interAnnotatorTitle: string;
  batchUploadTitle: string;
  batchUploadDesc: string;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    appTitle: "NenoGuard",
    subtitle: "Community Narrative Monitor • Narok & Kajiado Counties",
    navEntry: "Data Entry",
    navMap: "Spatial GIS Risk Map",
    navAnalytics: "Discourse Analytics",
    navValidation: "CBO Validation & Kappa",
    navBenchmark: "Model Benchmarks (K-Fold)",
    navArchive: "Narrative Archive",
    navEthics: "Ubuntu Ethics & Consent",
    navExport: "CBO Data Export",
    navLexicon: "Linguistic Lexicon",
    navReport: "Dossier",
    navSlides: "Defense Slides",
    navEntryShort: "Entry",
    navMapShort: "Map",
    navValidationShort: "Validate",
    navArchiveShort: "Archive",
    navExportShort: "Export",
    narrativeLabel: "Community Narrative Text",
    narrativePlaceholder: "Enter transcribed community narrative in Swahili or Maa...",
    langSelectLabel: "Narrative Language",
    ageBandLabel: "Narrator Age Band",
    genderLabel: "Narrator Gender",
    subCountyLabel: "Sub-County (Narok / Kajiado)",
    sourceOrgLabel: "Source Organisation (CBO)",
    annotationLabel: "Field Ground-Truth Annotation",
    consentConfirm: "I confirm informed consent has been obtained from the narrator to store and analyse this narrative.",
    consentModalTitle: "Ubuntu-Informed Ethical Consent Protocol",
    consentModalBody: "In accordance with African data sovereignty and ethical AI frameworks, narratives are pseudonymised without direct personal identifiers. Narratives are co-governed with community-based organisations (such as Tareto Africa Trust). Explicit narrator consent is mandatory before processing.",
    submitBtn: "Submit & Analyse Narrative",
    submittingBtn: "Processing NLP Inference...",
    statusOnline: "Connected (Live Sync)",
    statusOffline: "Offline Mode (Cached Locally)",
    syncingQueue: "Syncing queued narratives to server...",
    queueCount: "Cached Offline Items",
    analysisTitle: "NLP Discourse Analysis Results",
    predictedCategory: "Predicted Practice Pattern",
    confidenceScore: "Confidence Score",
    discourseStance: "Discourse Stance",
    markersDetected: "Detected Cultural & Dialect Markers",
    culturalNotes: "Qualitative Cultural Context Notes",
    exportTitle: "Research Data Export & Validation",
    exportDesc: "Download structured and unstructured research data for external validation with community-based organisation records.",
    downloadCsv: "Export CSV (Relational Dataset)",
    downloadJson: "Export JSON (Full Documents & Embeddings)",
    recordAudio: "Record Oral Narrative (Audio)",
    stopRecording: "Stop Recording",
    recordingActive: "Recording oral interview in progress...",
    audioPreview: "Oral Audio Playback Preview",
    transcribingAudio: "Transcribing speech to text...",
    xaiTitle: "Explainable AI (XAI) Token Highlighter",
    xaiExplanation: "Color-coded dialect markers extracted by the bilingual tokenizer:",
    cohensKappa: "Cohen's Kappa (Inter-Annotator Agreement)",
    macroF1: "Macro F1-Score",
    interAnnotatorTitle: "Qualitative Validation & Agreement Metrics",
    batchUploadTitle: "Batch CBO Dataset Upload & Validation",
    batchUploadDesc: "Upload field narrative batches from Tareto Africa Trust or partner CBOs to evaluate model precision against community ground-truth annotations."
  },
  sw: {
    appTitle: "NenoGuard",
    subtitle: "Kifaa cha Ufuatiliaji wa Simulizi za Jamii • Kaunti za Narok na Kajiado",
    navEntry: "Ingizo la Data",
    navMap: "Ramani ya Hatari za Kijiografia",
    navAnalytics: "Uchambuzi wa Simulizi",
    navValidation: "Uthibitishaji & Kappa ya CBO",
    navBenchmark: "Vipimo vya Modeli (K-Fold)",
    navArchive: "Kumbukumbu ya Simulizi",
    navEthics: "Maadili ya Ubuntu & Ridhaa",
    navExport: "Pakua Data ya CBO",
    navLexicon: "Leksikoni ya Kiisimu",
    navReport: "Ripoti ya Tasnifu",
    navSlides: "Slaidi za Utetezi",
    navEntryShort: "Ingizo",
    navMapShort: "Ramani",
    navValidationShort: "Thibitisha",
    navArchiveShort: "Kumbukumbu",
    navExportShort: "Pakua",
    narrativeLabel: "Maandishi ya Simulizi ya Jamii",
    narrativePlaceholder: "Weka simulizi ya jamii kwa Kiswahili au Maa...",
    langSelectLabel: "Lugha ya Simulizi",
    ageBandLabel: "Kundi la Umri la Msimulizi",
    genderLabel: "Jinsia ya Msimulizi",
    subCountyLabel: "Kaunti Ndogo (Narok / Kajiado)",
    sourceOrgLabel: "Shirika la Jamii (CBO)",
    annotationLabel: "Lebo ya Awali ya Uwandani",
    consentConfirm: "Nathibitisha ridhaa ya kisheria na kimaadili imepatikana kutoka kwa msimulizi ili kuhifadhi na kuchambua simulizi hii.",
    consentModalTitle: "Itifaki ya Maadili ya Ridhaa ya Ubuntu",
    consentModalBody: "Kulingana na mifumo ya heshima ya data ya Kiafrika, simulizi zote zinahifadhiwa bila majina au vitambulisho vya kibinafsi. Mashirika ya kijamii kama Tareto Africa Trust yanashirikiana kulinda haki za wasimulizi. Ni lazima msimulizi atoe ridhaa kabla ya uchakataji.",
    submitBtn: "Wasilisha & Chambua Simulizi",
    submittingBtn: "Inachakata Uchambuzi wa NLP...",
    statusOnline: "Imeunganishwa Mtandaoni",
    statusOffline: "Nje ya Mtandao (Imehifadhiwa Ndani)",
    syncingQueue: "Inapakia simulizi zilizohifadhiwa...",
    queueCount: "Simulizi Zilizohifadhiwa Nje ya Mtandao",
    analysisTitle: "Matokeo ya Uchambuzi wa NLP",
    predictedCategory: "Aina Iliyotambuliwa",
    confidenceScore: "Kiwango cha Uhakika",
    discourseStance: "Mwelekeo wa Simulizi",
    markersDetected: "Alama za Kiutamaduni Zilizotambuliwa",
    culturalNotes: "Muktadha wa Kiutamaduni",
    exportTitle: "Upakuaji wa Data ya Utafiti",
    exportDesc: "Pakua data ya utafiti kwa ajili ya uthibitishaji na mashirika ya kijamii (Lengo la 2).",
    downloadCsv: "Pakua CSV (Jedwali)",
    downloadJson: "Pakua JSON (Hati Kamili)",
    recordAudio: "Rekodi Simulizi ya Sauti",
    stopRecording: "Simamisha Kurekodi",
    recordingActive: "Inarekodi sauti ya mahojiano...",
    audioPreview: "Sikiliza Sauti Iliyorekodiwa",
    transcribingAudio: "Inabadilisha sauti kuwa maandishi...",
    xaiTitle: "Ufafanuzi wa Alama za Maneno (XAI)",
    xaiExplanation: "Alama za kiisimu zilizotambuliwa na modeli katika simulizi:",
    cohensKappa: "Kipimo cha Makubaliano (Cohen's Kappa)",
    macroF1: "Alama ya Macro F1",
    interAnnotatorTitle: "Uthibitishaji wa Ubora na Alama za Makubaliano (Lengo la 2)",
    batchUploadTitle: "Pakia Data Nyingi za CBO kwa Uthibitishaji",
    batchUploadDesc: "Pakia faili za simulizi kutoka kwa mashirika ya kijamii ili kupima usahihi wa modeli kulingana na lebo za uwandani."
  },
  maa: {
    appTitle: "NenoGuard",
    subtitle: "Enkiteshero e Ng'ejukisho e Koma • Kaunti e Narok o Kajiado",
    navEntry: "Aiger Ng'ejukisho",
    navMap: "Ramani e Narok & Kajiado",
    navAnalytics: "Ing'orat e Ng'ejukisho",
    navValidation: "Enkiteshero e CBO & Kappa",
    navBenchmark: "Vipimo e Modeli (K-Fold)",
    navArchive: "Enkishomi e Ng'ejukisho",
    navEthics: "Maadili e Ubuntu & Consent",
    navExport: "Awol Data e CBO",
    navLexicon: "Ilng'ejuk le Kutuk",
    navReport: "Ripoti e Dossier",
    navSlides: "Ilarin le Dossier",
    navEntryShort: "Aiger",
    navMapShort: "Ramani",
    navValidationShort: "Ekiteshero",
    navArchiveShort: "Enkishomi",
    navExportShort: "Awol",
    narrativeLabel: "Ng'ejukisho e Maa / Swahili",
    narrativePlaceholder: "Aiger ng'ejukisho e Maa te ena wuejita...",
    langSelectLabel: "Kutuk e Ng'ejukisho",
    ageBandLabel: "Larin le Ng'atuny",
    genderLabel: "Entito / Olee",
    subCountyLabel: "Kaunti Kutuk (Narok / Kajiado)",
    sourceOrgLabel: "Eshirika e Koma (CBO)",
    annotationLabel: "Emuratare / Esiankiki",
    consentConfirm: "Etejo olopeny ng'ejukisho nchere kintare ena bae to rishata.",
    consentModalTitle: "Esero e Ng'ejukisho e Ubuntu",
    consentModalBody: "Eing'uaa ng'ejukisho to siadi e ng'ejukisho enye metii enkarna e tung'ani. Eshirika e Tareto Africa Trust ketii ena ng'eno peeto.",
    submitBtn: "Aiger Ng'ejukisho & Ing'or",
    submittingBtn: "Eing'or NLP...",
    statusOnline: "Ketii Intanet",
    statusOffline: "Metii Intanet (Eisuweiyoki)",
    syncingQueue: "Eituwei te server...",
    queueCount: "Ng'ejukisho naitua",
    analysisTitle: "Matokeo e NLP",
    predictedCategory: "Enkituroto e Bae",
    confidenceScore: "Enkiteshero",
    discourseStance: "Mwelekeo e Maa",
    markersDetected: "Alama e Ng'eno e Maa",
    culturalNotes: "Enkiguran e Koma",
    exportTitle: "Awol Data e Utafiti",
    exportDesc: "Awol data to kompiuta peeing'or to shule o CBO (Lengo 2).",
    downloadCsv: "Awol CSV",
    downloadJson: "Awol JSON",
    recordAudio: "Iruk Oltoilo le Ng'ejukisho",
    stopRecording: "Tasheyie Eruko",
    recordingActive: "Eruko oltoilo...",
    audioPreview: "Ining'o Oltoilo le Ng'ejukisho",
    transcribingAudio: "Eiger oltoilo...",
    xaiTitle: "Enkiteshero e Ng'eno (XAI)",
    xaiExplanation: "Alama e Maa naituroki to kitabu:",
    cohensKappa: "Cohen's Kappa (Enkiteshero e CBO)",
    macroF1: "Macro F1",
    interAnnotatorTitle: "Enkituroto e Utafiti o CBO (Lengo 2)",
    batchUploadTitle: "Awol Ng'ejukisho Kumok e Tareto Africa",
    batchUploadDesc: "Iteje data e shule peeing'or enkiteshero e kompiuta."
  }
};
