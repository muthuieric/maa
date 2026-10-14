# NenoGuard — Community Narrative Monitor

A bilingual tool for capturing and analysing community narratives to surface early warning signals of harmful traditional practices — specifically **female genital mutilation (FGM)** (*ukeketaji* / *emuratare*) and **child marriage** (*ndoa za mapema* / *esiankiki*) — across **Narok and Kajiado Counties, Kenya**.

Narratives can be entered in **Swahili (Kiswahili)** or **Maa**, are classified on the fly by a bilingual NLP engine, and are stored with a verifiable consent trail.

---

## 1. How It Works

1. **Capture** — A field worker records a narrative through the web form. They pick the narrator's language (Swahili or Maa), age band, gender, sub-county, partner organisation, and a practice label, and confirm that the narrator has given informed consent. Audio capture with in-browser recording and transcription preview is available for narrators who speak rather than type.
2. **Consent gate** — Submissions without explicit consent (`consent_given: false`) are rejected immediately with HTTP 400. Nothing is stored or analysed without it.
3. **Bilingual NLP analysis** — The backend runs a multilingual classifier with domain-specific lexicons for Swahili and Maa dialect terms. It returns a predicted category (FGM / Child Marriage / Other harmful norm / None), a confidence score with per-class breakdown, detected cultural markers, and a discourse stance (e.g. advocacy vs. descriptive).
4. **Explainable result** — The frontend highlights detected terms directly on the narrative text with weights and translations, so the reasoning behind a classification is visible.
5. **Review & validate** — Predictions can be compared against human ground-truth annotations. The validation view reports agreement (Cohen's Kappa), Macro F1, and a confusion matrix, and accepts batch uploads of annotated records.
6. **Explore & export** — All narratives are searchable and filterable (by language, sub-county, category) in an archive view, mappable as a geographic heatmap of risk and practice prevalence, and exportable as CSV or JSON for offline review.
7. **Offline-first** — If the device loses connectivity, submissions are queued client-side in IndexedDB and automatically synchronised to the server once the connection is restored. A status badge in the navbar shows the online/offline state and the number of cached items.

### Key capabilities

- **Trilingual UI** — Fully localised interface in English, Swahili, and Maa.
- **Oral narrative capture** — In-browser Web Audio / MediaRecorder recording with playback and transcription preview.
- **Explainable AI (XAI) token highlighter** — Token-level visual breakdown of dialect terms, semantic weights, and translations on the narrative.
- **Field validation** — Automated comparison of NLP predictions against community annotations, with Cohen's Kappa and Macro F1.
- **Narrative explorer & audit archive** — Searchable repository with sub-county filters and verifiable consent records.
- **Offline queue** — IndexedDB-backed caching with automatic background sync on reconnection.
- **Consent withdrawal** — Consent can be withdrawn after the fact via the ethics API, which removes the associated record.

---

## 2. Architecture

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide icons.
- **Backend:** FastAPI (Python 3.12), Pydantic v2, Uvicorn async ASGI server.
- **NLP engine:** Multilingual classification with domain-specific morphological lexicons for Swahili and Maa.
- **Hybrid storage:**
  - **PostgreSQL (SQL)** — Relational metadata (`age_band`, `gender`, `sub_county`, `source_org`, `consent_given`, `timestamp`).
  - **MongoDB (NoSQL)** — Narrative text, model predictions, confidence scores, detected dialect markers, discourse stances.
  - **Automatic local fallback** — Gracefully falls back to SQLite and a local JSON document store when the live database daemons are not running (useful for local development and inspection).
- **Orchestration:** Docker Compose multi-container setup.

---

## 3. Project Structure

```
├── docker-compose.yml              # Postgres, MongoDB, FastAPI, Next.js
├── run-dev.sh                      # Local launcher (starts both servers)
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, CORS, lifespan, legacy routes
│   │   ├── config.py               # Settings and database connections
│   │   ├── database.py             # Hybrid SQL + NoSQL repository with fallback
│   │   ├── schemas.py              # Pydantic models for submissions and responses
│   │   ├── nlp/
│   │   │   ├── lexicon.py          # Swahili & Maa cultural markers and vocabulary
│   │   │   ├── classifier.py       # Bilingual classification & stance engine
│   │   │   └── corpus_generator.py # Synthetic corpus generation
│   │   └── routers/
│   │       ├── narratives.py       # Submit, list, batch import, validation, heatmap
│   │       ├── export.py           # CSV / JSON export
│   │       ├── stats.py            # Aggregated corpus statistics
│   │       ├── ethics.py           # Consent audit ledger and withdrawal
│   │       └── lexicon_router.py   # Cultural & dialect lexicon access
│   ├── tests/
│   │   └── test_api.py             # API, consent-gate, and NLP tests
│   ├── Dockerfile
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx            # Narrative entry page
    │   │   ├── map/page.tsx        # Geographic heatmap view
    │   │   ├── validation/page.tsx # Field validation & batch upload
    │   │   ├── archive/page.tsx    # Searchable narrative explorer
    │   │   ├── export/page.tsx     # CSV / JSON download portal
    │   │   ├── layout.tsx
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── Navbar.tsx           # Navigation, language switcher, sync badge
    │   │   ├── NarrativeForm.tsx    # Bilingual narrative input form
    │   │   ├── ConsentModal.tsx     # Informed-consent explanation
    │   │   ├── LanguageSwitcher.tsx # Trilingual selector (EN / SW / MAA)
    │   │   ├── SyncStatusBadge.tsx  # Real-time online/offline indicator
    │   │   ├── AudioRecorder.tsx    # In-browser oral narrative capture
    │   │   └── PredictionResultCard.tsx # Classification & dialect markers
    │   └── lib/
    │       ├── translations.ts      # Trilingual dictionary
    │       └── offlineStorage.ts    # IndexedDB offline queue and sync
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    └── tailwind.config.ts
```

---

## 4. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/narratives/submit` (alias: `/submit`) | Consent-gated narrative submission and NLP analysis |
| `GET` | `/api/narratives` | Paginated narrative list, filterable by language, sub-county, category, and search text |
| `POST` | `/api/narratives/batch-import` | Bulk import of annotated records for validation |
| `GET` | `/api/narratives/validation-report` | Agreement metrics (Cohen's Kappa, Macro F1, confusion matrix) |
| `GET` | `/api/narratives/geographic-heatmap` | Aggregated per-sub-county risk and practice prevalence |
| `GET` | `/api/export` (alias: `/export`) | Data export as `format=csv` or `format=json` |
| `GET` | `/api/stats` | Aggregated corpus statistics (languages, categories, sub-counties, consent compliance) |
| `GET` | `/api/ethics/audit-ledger` | Read-only ledger of consent records |
| `POST` | `/api/ethics/withdraw-consent/{narrative_id}` | Withdraw consent and delete the associated narrative |
| `GET` | `/api/lexicon` | Cultural and dialect lexicon used by the classifier |
| `GET` | `/api/health` (alias: `/health`) | System health check |

### Consent enforcement
Submissions lacking explicit informed consent are rejected with HTTP 400:
```json
{
  "detail": "Informed consent is mandatory. No narrative can be stored or analysed without narrator consent."
}
```

---

## 5. Getting Started

### Configuration (required — secrets are never committed)

Database credentials are **not** stored in the repo. Create a local `.env` from the
template and generate a strong password:

```bash
cp .env.example .env
# then edit .env, or generate the password:
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

`.env` is gitignored. Compose refuses to start if `POSTGRES_PASSWORD` is unset.

> **If a credential was previously committed, rotate it.** Rewriting history with
> `git filter-repo` and force-pushing is required, because the old value remains
> readable in every clone and fork:

```bash
pip install git-filter-repo
git filter-repo --replace-text <(printf 'nenoguard_secure_pass_2026==>REDACTED\n')
git push --force --all origin
```

### Option A: Docker Compose (recommended)

Starts PostgreSQL, MongoDB, the FastAPI backend, and the Next.js frontend in one command:

```bash
docker compose up --build
```

### Option B: Local development

Start both servers with the bundled launcher:

```bash
./run-dev.sh
```

Or start them manually in two terminals:

**1. Backend (FastAPI):**
```bash
# Binds to loopback only. To expose on your LAN (field tablets), set HOST=0.0.0.0 deliberately.
HOST=127.0.0.1 PYTHONPATH=backend/site-packages:. python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

**2. Frontend (Next.js):**
```bash
cd frontend
npm install
npm run dev
```

### Accessing the app

| What | Where |
|---|---|
| Web application | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Interactive API docs (Swagger) | http://localhost:8000/docs |
| Health check | http://localhost:8000/api/health |

The frontend proxies all `/api/*` requests to the backend at `http://localhost:8000` (configurable via the `NEXT_PUBLIC_API_URL` environment variable), so only the frontend URL needs to be opened in a browser.

Once the app is open:

- Use the **language switcher** (top right) to toggle between English, Swahili, and Maa.
- Fill in the narrative form on the home page and confirm consent to submit; the analysis result appears immediately below the form.
- Use the top navigation to reach the **Map** (geographic heatmap), **Validation** (agreement metrics and batch upload), **Archive** (search and filter past narratives), and **Export** (CSV/JSON download) views.
- If the network drops, submissions are queued locally and sync automatically when you are back online — the navbar badge shows the connection state and queue depth.

---

## 6. Running Tests

Run the backend test suite, which covers health checks, consent-gate enforcement, Swahili FGM analysis, Maa child-marriage analysis, advocacy stance detection, stats aggregation, data export, and batch import with agreement metrics:
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

