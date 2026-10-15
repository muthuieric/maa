# NenoGuard — Community Narrative Monitor

A bilingual tool for capturing and analysing community narratives to surface early warning signals of harmful traditional practices — specifically **female genital mutilation (FGM)** (*ukeketaji* / *emuratare*) and **child marriage** (*ndoa za mapema* / *esiankiki*) — across **Narok and Kajiado Counties, Kenya**.

Narratives can be entered in **Swahili (Kiswahili)** or **Maa**, are classified on the fly by a bilingual NLP engine, and are stored with a verifiable consent trail.

---

## Table of Contents

1. [How It Works](#1-how-it-works)
2. [How to Interact with This App](#2-how-to-interact-with-this-app)
3. [Architecture](#3-architecture)
4. [Project Structure](#4-project-structure)
5. [API Endpoints](#5-api-endpoints)
6. [Getting Started / Installation](#6-getting-started-installation)
7. [English → Maasai Translation (optional)](#7-english--maasai-translation-optional)
8. [Running Tests](#8-running-tests)
9. [Tech Stack](#9-tech-stack)
10. [Security & Consent](#10-security--consent)

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
- **Form persistence** — Narrative form data is persisted to `localStorage` (key: `nenoguard-narrative-form`). If you navigate away and return, your input is restored. Data clears automatically on successful submission.

---

## 2. How to Interact with This App

### Opening the app

Once both servers are running, open **http://localhost:3000** in your browser.

### Navigation

The top navigation bar has been intentionally simplified. It contains only:
- **Brand / NG logo** — returns you to the home page (role picker). Clicking it stays on `/` (no auto-redirect).
- **Role badge** — shows your current role context.
- **Sync status badge** — shows online/offline state and offline queue depth.
- **Language switcher** — toggle between English, Swahili, and Maa.

All desktop and mobile navigation links (Collect Data, Translate, Review, Map, Validation, Archive, Export) have been **removed** from the navbar and mobile drawer. To reach any view, navigate directly by typing the URL path:

| View | URL path | What it does |
|------|----------|--------------|
| Home / Role picker | `/` | Landing page; shows role picker |
| Collect Data | `/collect` | Narrative entry form with consent gate and NLP analysis |
| Translate | `/translate` | English → Maasai translation tool |
| Review | `/review` | Review and annotate predictions |
| Map | `/map` | Geographic heatmap of risk and practice prevalence |
| Validation | `/validation` | Agreement metrics (Cohen's Kappa, Macro F1) and batch import |
| Archive | `/archive` | Searchable narrative explorer with filters |
| Export | `/export` | CSV / JSON download portal |

### Submitting a narrative (Collect Data)

1. Go to `http://localhost:3000/collect`.
2. Enter the narrative text in Swahili or Maa.
3. Select language, age band, gender, sub-county, source organisation, and practice label.
4. Check the informed-consent box (mandatory — submissions without consent are rejected).
5. Submit. The NLP analysis result appears immediately below the form.

### Form data persistence

If you fill out part of the Collect Data form and navigate away, your input is saved to `localStorage`. When you return to `/collect`, the form repopulates with what you entered. Data clears automatically after a successful submission.

### Validation page

Go to `http://localhost:3000/validation` to see real-time agreement metrics across all stored narratives: total evaluated, accuracy, macro F1, Cohen's Kappa, per-class precision/recall/F1, and a confusion matrix. You can also load a sample batch or upload your own annotated JSON for batch validation.

**Note:** The Validation page fetches metrics from the backend at `/api/narratives/validation-report`. If the backend is not running, the page will show `0` silently (no error banner). Start the backend first (see Installation below).

### Archive, Export, Map

- **Archive** (`/archive`): search and filter stored narratives by language, sub-county, category, or keyword.
- **Export** (`/export`): download all narratives as CSV or JSON.
- **Map** (`/map`): geographic heatmap of risk and practice prevalence by sub-county.

---

## 3. Architecture

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons.
- **Backend:** FastAPI (Python 3.12), Pydantic v2, Uvicorn async ASGI server.
- **NLP engine:** Multilingual classification with domain-specific morphological lexicons for Swahili and Maa.
- **Hybrid storage:**
  - **PostgreSQL (SQL)** — Relational metadata (`age_band`, `gender`, `sub_county`, `source_org`, `consent_given`, `timestamp`). Falls back to SQLite if PostgreSQL is unavailable.
  - **MongoDB (NoSQL)** — Narrative text, model predictions, confidence scores, detected dialect markers, discourse stance, cultural context notes. Falls back to local JSON if MongoDB is unavailable.
- **Orchestration:** Docker Compose multi-container setup.
- **Form persistence:** `localStorage` on the frontend; `IndexedDB` offline queue with automatic background sync.

---

## 4. Project Structure

```
├── docker-compose.yml              # Postgres, MongoDB, FastAPI, Next.js
├── run-dev.sh                      # Local launcher (starts both servers)
├── .env.example                    # Environment template (copy to .env)
├── .env                            # Local secrets — gitignored, never commit
├── README.md                       # This file
├── DESIGN.md                       # UI/UX design specification
├── harmful-practice-nlp-tool.md    # NLP tool documentation
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
│   ├── requirements.txt
│   ├── narratives_meta.db          # SQLite fallback database (local dev)
│   └── narratives_docs.json        # JSON fallback document store (local dev)
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx            # Home / role picker
    │   │   ├── collect/page.tsx    # Narrative entry form
    │   │   ├── translate/page.tsx  # English → Maasai translation
    │   │   ├── review/page.tsx     # Review and annotate
    │   │   ├── map/page.tsx        # Geographic heatmap
    │   │   ├── validation/page.tsx # Validation metrics & batch import
    │   │   ├── archive/page.tsx    # Searchable narrative explorer
    │   │   ├── export/page.tsx     # CSV / JSON download portal
    │   │   ├── layout.tsx
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── Navbar.tsx           # Navigation, language switcher, sync badge
    │   │   ├── NarrativeForm.tsx    # Bilingual narrative input form (+ localStorage persistence)
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

## 5. API Endpoints

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
| `GET` | `/api/translate/status` | Whether English→Maasai translation is available (deps/weights) |
| `POST` | `/api/translate` | Translate English text into Maasai (NLLB + LoRA adapter) |
| `POST` | `/api/translate/batch` | Translate up to 20 English texts per request |
| `GET` | `/api/health` (alias: `/health`) | System health check |

### Consent enforcement
Submissions lacking explicit informed consent are rejected with HTTP 400:
```json
{
  "detail": "Informed consent is mandatory. No narrative can be stored or analysed without narrator consent."
}
```

---

## 6. Getting Started / Installation

### Configuration (required — secrets are never committed)

Database credentials are **not** stored in the repo. Create a local `.env` from the
template and generate a strong password:

```bash
cp .env.example .env
# then edit .env, or generate the password:
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

`.env` is gitignored. Compose refuses to start if `POSTGRES_PASSWORD` is unset.

> **If a credential was previously committed, rotate it.** Removing it from the
> working tree is not enough — the old value stays readable in every clone and
> fork until history is rewritten and force-pushed:

```bash
pip install git-filter-repo
# Replace the literal old password with REDACTED across all of history.
# (Do not paste the real value into this file — add it locally instead.)
git filter-repo --replace-text <(printf 'YOUR_OLD_PASSWORD==>REDACTED\n')
git push --force --all origin
```

Then delete/revoke the old credential wherever else it was used.

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
- Navigate directly by URL to other views (navbar links were removed): `/collect`, `/translate`, `/review`, `/map`, `/validation`, `/archive`, `/export`.
- If the network drops, submissions are queued locally and sync automatically when you are back online — the navbar badge shows the connection state and queue depth.

---

## 7. English → Maasai Translation (optional)

NenoGuard can translate English text into Maa using a community-trained adapter:

- **Base model:** `facebook/nllb-200-distilled-600M`
- **Adapter:** [`KnoxDevelopers/English-to-Maasai-language-translation-LoRA`](https://huggingface.co/KnoxDevelopers/English-to-Maasai-language-translation-LoRA) — a PEFT LoRA (r=16, α=32), licence **cc-by-nc-4.0 (non-commercial)**

### Enabling it

The translation stack is optional and **lazy**: the API boots fine without it, and
the model is only downloaded on the first translate request.

```bash
pip install -r backend/requirements.txt   # adds peft, safetensors, sentencepiece
```

Then check readiness — this does not download anything:

```bash
curl http://localhost:8000/api/translate/status
```

And translate:

```bash
curl -X POST http://localhost:8000/api/translate \
  -H 'Content-Type: application/json' \
  -d '{"text": "We must protect girls from harmful practices."}'
```

A CLI is also available for quick checks:

```bash
PYTHONPATH=backend/site-packages:. python3 scripts/translate_cli.py --status
PYTHONPATH=backend/site-packages:. python3 scripts/translate_cli.py "Hello, how are you?"
```

### Hardware expectations

The first request downloads **~3.5 GB** (base model + adapter) and takes minutes.
Inference runs on CPU here, at roughly a few seconds per sentence, so it is
dispatched to a thread pool rather than blocking the API event loop.

On this machine (7.7 GB RAM, no GPU) reduce memory pressure with:

```bash
# in .env — roughly halves RAM use vs float32
TRANSLATION_DTYPE=bfloat16
```

Useful knobs: `TRANSLATOR_ENABLED`, `TRANSLATION_SRC_LANG`, `TRANSLATION_TGT_LANG`,
`TRANSLATION_MAX_NEW_TOKENS`, `TRANSLATION_CACHE_DIR` (default `backend/models/`,
gitignored).

### Accuracy caveat — read before relying on output

The adapter was fine-tuned on a small parallel corpus. Reported metrics are
**sacreBLEU 7.23** and **chrF++ 36.48**. In practice it captures the meaning and
root vocabulary but varies in spelling and word forms from standard orthography.
Direction is **English → Maasai only** (there is no Maa → English adapter here).

Treat output as a drafting aid and have a Maa speaker review it before any
community-facing use. Given the cc-by-nc-4.0 licence, it must not be used in
commercial products.

---

## 8. Running Tests

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

### Translation tests

```bash
PYTHONPATH=backend/site-packages:. python3 -m backend.tests.test_translate
```

These verify routing, the graceful `503` when `torch`/`transformers`/`peft` are
absent, request validation, and the response contract — all **without**
downloading the model. To exercise a real translation (requires the ~3.5 GB
weights cached locally), opt in explicitly:

```bash
RUN_MODEL_TESTS=1 PYTHONPATH=backend/site-packages:. python3 -m backend.tests.test_translate
```

---

## 9. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | Next.js | 15.2.3 |
| UI library | React | 19.x |
| Language | TypeScript | 5.3.x |
| Styling | Tailwind CSS | 3.4.x |
| Icons | Lucide React | 0.475.x |
| Offline storage | idb (IndexedDB) | 8.x |
| Backend framework | FastAPI | 0.110.x |
| ASGI server | Uvicorn | 0.28.x |
| Data validation | Pydantic | 2.6.x |
| Python runtime | Python | 3.12 |
| NLP / ML | transformers, torch | 4.38.x / 2.2.x |
| Translation adapter | PEFT (LoRA) | 0.19.x |
| SQL database | PostgreSQL (with SQLite fallback) | 16 |
| NoSQL database | MongoDB (with JSON fallback) | 7 |
| Container orchestration | Docker Compose | 3.8 |

---

## 10. Security & Consent

- **Consent is mandatory.** No narrative is stored or analysed without `consent_given: true`.
- **Pseudonymisation.** Narrative text is separated from metadata; records receive a pseudonymised token (`NG-NAR-XXXXXXXX`).
- **Consent audit ledger.** Every consent record is cryptographically fingerprinted (SHA-256) and auditable via `/api/ethics/audit-ledger`.
- **Right to be forgotten.** Consent can be withdrawn via `/api/ethics/withdraw-consent/{narrative_id}`, which purges the record.
- **Database binding.** PostgreSQL and MongoDB bind to `127.0.0.1` only in Docker Compose — never exposed to the network.
- **Secrets.** `.env` is gitignored. Rotate any credential that was previously committed.

