# Natural Language Processing (NLP) for Detecting Harmful Practice Narratives in Rural Kenya

**Programme:** MSc Artificial Intelligence  
**Institution:** Open University of Kenya (OUK)  
**Author:** Jeffrey Shihembetsa  
**Context:** Module 2 Thesis Implementation — Narok and Kajiado Counties, Kenya  

---

## 1. Project Background & Research Overview

Harmful traditional practices such as **female genital mutilation (FGM)** (*ukeketaji* / *emuratare*) and **child marriage** (*ndoa za mapema* / *esiankiki*) remain persistent challenges in rural Kenya, particularly across **Narok and Kajiado Counties**. Deeply embedded in cultural narratives and oral discourse, these practices resist purely legalistic interventions.

This project operationalises a bilingual Natural Language Processing (NLP) tool tailored to **Swahili (Kiswahili)** and **Maa (Southern Nilotic)** community narratives. It addresses the methodological and technical gaps identified in African NLP literature (Hu et al., 2024; Adelani et al., 2025; ACM FAccT, 2025).

### Research Questions & Objectives Alignment

| Research Question | Objective | System Feature |
|---|---|---|
| **RQ1:** Can an NLP model trained on Swahili and Maa accurately detect harmful practice patterns? | **Objective 1:** Build bilingual model for Swahili & Maa discourse detection | Fine-tuned Transformer / Linguistic Heuristic Engine classifying FGM, Child Marriage, Stance, and cultural markers |
| **RQ2:** How valid and culturally relevant is the model against CBO field qualitative data? | **Objective 2:** Validate against qualitative data from CBOs (e.g. Tareto Africa Trust) | Structured validation schema, ground-truth label tracking, and CBO data export portal (CSV & JSON) |
| **RQ3:** What ethical model governs NLP tools in linguistically marginalised communities? | **Objective 3:** Implement Ubuntu-informed ethics, consent, and data sovereignty | Mandatory informed consent gate, strict pseudonymisation (UUIDs), and isolated hybrid storage |

---

## 2. Modern Upgraded Architecture

Replacing initial basic HTML/CSS/JS and Flask prototypes with a modern, production-grade full-stack architecture:

- **Frontend:** **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, Lucide Icons.
- **Trilingual User Interface:** Complete localization across **English**, **Swahili (Kiswahili)**, and **Maa**.
- **Oral Audio Narrative Capture:** Integrated in-browser Web Audio / MediaRecorder with oral narrative playback and transcription preview for narrators who speak rather than type.
- **Explainable AI (XAI) Token Highlighter:** Interactive token-level visual breakdown displaying dialect terms, semantic weights, and translations directly on the narrative.
- **CBO Field Validation & Cohen's Kappa Engine:** Automated evaluation comparing NLP predictions against community ground-truth annotations with Inter-Annotator Agreement (Cohen's Kappa), Macro F1, and confusion matrices (Objective 2).
- **Field Narrative Explorer & Audit Archive:** Searchable repository with sub-county filters and verifiable consent trails (Objective 3).
- **Offline-First Field Capability:** Client-side **IndexedDB** queue enabling offline data entry by field officers in remote areas of Narok and Kajiado, with automatic background synchronization upon reconnection.
- **Backend API:** **FastAPI (Python 3.12)**, **Pydantic v2**, Uvicorn async ASGI server.
- **Bilingual NLP Engine:** Multilingual classification with domain-specific morphological lexicons for Swahili and Maa dialect terms.
- **Hybrid Data Storage:**
  - **PostgreSQL (SQL):** Relational metadata (`age_band`, `gender`, `sub_county`, `source_org`, `consent_given`, `timestamp`).
  - **MongoDB (NoSQL):** Unstructured narrative text, model predictions, confidence scores, detected dialect markers, and discourse stances.
  - *Automated Local Fallback:* Gracefully falls back to SQLite and local JSON document store if live database daemons are not running during local inspection.
- **Orchestration:** **Docker Compose** multi-container setup.

---

## 3. Directory Structure

```
├── docker-compose.yml              # Multi-container orchestration (Postgres, Mongo, FastAPI, Next.js)
├── DESIGN.md                       # Design specification and token system (Mara Savanna theme)
├── harmful-practice-nlp-tool.md    # Master engineering execution plan
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application, CORS, lifespan, backward-compatible routes
│   │   ├── config.py               # Settings and database connections
│   │   ├── database.py             # Hybrid SQL + NoSQL repository with automatic fallback
│   │   ├── schemas.py              # Pydantic models for submissions, responses, and statistics
│   │   ├── nlp/
│   │   │   ├── lexicon.py          # Maa and Swahili cultural markers & vocabularies
│   │   │   └── classifier.py       # Bilingual classification & discourse stance engine
│   │   └── routers/
│   │       ├── narratives.py       # POST /api/narratives/submit & GET /api/narratives
│   │       ├── export.py           # GET /api/export (CSV and JSON)
│   │       └── stats.py            # GET /api/stats (Aggregated research metrics)
│   ├── tests/
│   │   └── test_api.py             # Comprehensive API, consent gate, and NLP tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Main Narrative Entry Page
│   │   │   ├── analytics/page.tsx  # Discourse Analytics & Distribution Dashboard
│   │   │   ├── export/page.tsx     # CBO Data Export Portal
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Navigation, language switcher, sync badge
│   │   │   ├── NarrativeForm.tsx   # Bilingual narrative input form
│   │   │   ├── ConsentModal.tsx    # Ubuntu ethical consent explanation
│   │   │   ├── LanguageSwitcher.tsx# Trilingual selector (EN / SW / MAA)
│   │   │   ├── SyncStatusBadge.tsx # Real-time online/offline indicator
│   │   │   └── PredictionResultCard.tsx # Visual classification & dialect markers
│   │   └── lib/
│   │       ├── translations.ts     # Trilingual dictionary
│   │       └── offlineStorage.ts   # IndexedDB offline caching and sync queue
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
└── run-dev.sh                      # Local dual-server launcher
```

---

## 4. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/narratives/submit` (alias: `/submit`) | Consent-gated narrative submission and NLP discourse analysis |
| `GET` | `/api/narratives` | Paginated narrative list with filters by language and sub-county |
| `GET` | `/api/export` (alias: `/export`) | Dual-format export (`format=csv` or `format=json`) for CBO offline validation |
| `GET` | `/api/stats` | Aggregated corpus statistics (languages, categories, sub-counties, compliance) |
| `GET` | `/api/health` (alias: `/health`) | System health check and objective status |

### Mandatory Consent Enforcement (Objective 3)
Submissions lacking explicit informed consent (`consent_given: false`) are rejected immediately with HTTP 400:
```json
{
  "detail": "Informed consent is mandatory. No narrative can be stored or analysed without narrator consent."
}
```

---

## 5. How to Run

### Option A: Using Docker Compose (Recommended Production Setup)
Starts PostgreSQL, MongoDB, FastAPI, and Next.js in a single command:
```bash
docker compose up --build
```
- Frontend UI: `http://localhost:3000`
- FastAPI Backend: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

### Option B: Local Development
**1. Start the FastAPI Backend:**
```bash
PYTHONPATH=backend/site-packages:. python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

**2. Start the Next.js Frontend:**
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 6. Running Tests

Run the backend verification suite covering health checks, consent enforcement, Swahili FGM analysis, Maa child marriage analysis, counter-narrative stance detection, stats aggregation, and data export:
```bash
PYTHONPATH=backend/site-packages:. python3 -c "
from backend.tests.test_api import (
    test_health_check,
    test_consent_gate_enforcement,
    test_swahili_fgm_submission,
    test_maa_child_marriage_submission,
    test_advocacy_stance_detection,
    test_stats_and_export,
    test_backward_compatible_paper_routes,
    test_batch_import_and_cohens_kappa
)
test_health_check()
test_consent_gate_enforcement()
test_swahili_fgm_submission()
test_maa_child_marriage_submission()
test_advocacy_stance_detection()
test_stats_and_export()
test_backward_compatible_paper_routes()
test_batch_import_and_cohens_kappa()
print('All 8 backend & validation tests passed!')
"
```

