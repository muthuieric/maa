# Harmful Practice Narrative Detection Tool (Rural Kenya)
## MSc Artificial Intelligence — Literature Review & Tool Implementation Plan
**Author:** Jeffrey Shihembetsa | **Institution:** Open University of Kenya (OUK)

---

## 1. Project Overview & Research Objectives
This project operationalises an NLP-based research tool for detecting discourse patterns associated with harmful traditional practices (Female Genital Mutilation [FGM], Child Marriage, and gendered harmful norms) in Narok and Kajiado Counties, Kenya.

### Objectives Addressed:
- **Objective 1 (Model Development):** Bilingual NLP model (Swahili and Maa narratives) capable of tokenising, classifying, and scoring harmful practice discourse.
- **Objective 2 (Validation & Field Relevance):** Validation framework comparing predictions against ground-truth labels and field data from community-based organisations (e.g. Tareto Africa Trust).
- **Objective 3 (Ethical AI & Data Sovereignty):** Ubuntu-informed ethical model with mandatory informed consent gating, pseudonymisation, separation of narrative text from demographic metadata, and community-controlled export.

---

## 2. Technology Stack Selection (Upgraded Architecture)
Replacing the paper's initial vanilla HTML/CSS/JS and Flask prototypes with modern, production-grade frameworks:

| Component | Technology | Rationale |
|---|---|---|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons | Mobile-responsive, component-driven, trilingual (EN/SW/MAA), accessible on field tablets/smartphones |
| **Offline Cache** | IndexedDB (Dexie / native idb) + Web Workers | Offline-first narrative entry for rural Narok/Kajiado with automatic synchronization when network is restored |
| **Backend API** | Python FastAPI, Pydantic v2, Uvicorn | Async performance, strict data validation, auto-generated OpenAPI documentation, CORS support |
| **NLP Pipeline** | HuggingFace Transformers (`bert-base-multilingual-cased` / AfroXLMR) + Swahili/Maa Lexicon Fallback | Dual inference engine: transformer model with rule-based/dialectal heuristics for instant offline/local execution |
| **Structured Store** | PostgreSQL (Docker Compose / Neon / SQLite fallback) | Stores demographic, sub-county, source organisation, and consent audit logs |
| **Unstructured Store** | MongoDB (Docker Compose / TinyDB-JSON document fallback) | Stores raw narrative text, tokens, embeddings, model predictions, and confidence scores |
| **Containerization** | Docker Compose | Single-command orchestration for PostgreSQL, MongoDB, FastAPI backend, and Next.js frontend |

---

## 3. Data Schema & Architecture

### 3.1 PostgreSQL Schema (`narrative_metadata`)
```sql
CREATE TABLE IF NOT EXISTS narrative_metadata (
    id SERIAL PRIMARY KEY,
    narrative_id VARCHAR(64) UNIQUE NOT NULL,
    age_band VARCHAR(20) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    sub_county VARCHAR(50) NOT NULL,
    source_org VARCHAR(100) NOT NULL,
    consent_given BOOLEAN NOT NULL,
    consent_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    date_collected TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sub_county ON narrative_metadata(sub_county);
CREATE INDEX IF NOT EXISTS idx_source_org ON narrative_metadata(source_org);
```

### 3.2 MongoDB Document Schema (`narratives`)
```json
{
  "_id": "ObjectId(...)",
  "narrative_id": "uuid4_string",
  "narrative": "Text in Swahili or Maa...",
  "language": "Swahili | Maa",
  "label": "FGM | Child marriage | Other | None",
  "prediction_label": "FGM | Child marriage | Other | None",
  "prediction_score": 0.942,
  "confidence_breakdown": {
    "FGM": 0.942,
    "Child marriage": 0.031,
    "Other": 0.018,
    "None": 0.009
  },
  "keywords_detected": ["enkipaata", "kutahiri", "emuratare"],
  "model_version": "v1.0.0-bilingual",
  "created_at": "ISO-8601-timestamp"
}
```

---

## 4. API Endpoints (FastAPI)

1. `POST /api/submit`:
   - Enforces `consent_given == True` (HTTP 400 rejection if False).
   - Generates unique pseudonymised `narrative_id`.
   - Runs NLP inference (Swahili/Maa transformer + lexical analysis).
   - Stores narrative document in MongoDB.
   - Stores structured metadata in PostgreSQL.
   - Returns classification results, confidence, and storage confirmation.

2. `GET /api/narratives`:
   - Paginated list of narratives with filtering by language, sub-county, category, and date.

3. `GET /api/stats`:
   - Aggregated metrics: narrative counts per sub-county, language distribution, predicted practice distribution, consent audit count.

4. `GET /api/export?format=csv|json`:
   - Dual-format data export combining joined metadata and analysis for offline validation with community-based organisations.

5. `GET /api/health`:
   - System health, database connection checks, and model readiness status.

---

## 5. Implementation Roadmap (Step-by-Step)

- [x] **Phase 1: Project Scaffolding & Hybrid Storage Infrastructure**
  - Created directory structure (`backend/` and `frontend/`).
  - Configured `docker-compose.yml` for PostgreSQL, MongoDB, FastAPI, and Next.js.
  - Implemented FastAPI backend with database connections and graceful SQLite/JSON offline fallback.

- [x] **Phase 2: Bilingual NLP Engine & API Development**
  - Implemented the Swahili & Maa classification pipeline with domain-specific lexicons (FGM, Child Marriage terms in Maa and Swahili).
  - Implemented `/api/narratives/submit` (and legacy `/submit`) with strict consent verification.
  - Implemented `/api/export` (and legacy `/export`), `/api/stats`, and `/api/health`.
  - Added and passed 7 automated backend tests for API endpoints, consent gating, and stance classification.

- [x] **Phase 3: Next.js Frontend with Trilingual UI & PWA Offline Sync**
  - Authored `DESIGN.md` conforming to Mara Savanna civic tokens.
  - Scaffolded Next.js application with Tailwind CSS and TypeScript.
  - Implemented Trilingual dictionary (English, Swahili, Maa).
  - Built responsive Data Entry Form with mandatory consent verification modal.
  - Built IndexedDB offline sync queue (caches submissions when offline, syncs when back online).
  - Built Analytics & Data Export dashboard.
  - Successfully verified Next.js production build (`next build`).

- [x] **Phase 4: Integration, Validation & Verification**
  - Verified backward compatibility with original paper routes (`/submit` and `/export`).
  - Verified end-to-end classification across Maa (*emuratare*, *esiankiki*, *enkaputi*) and Swahili (*ukeketaji*, *ndoa za mapema*) narratives.
  - Verified dual CSV & JSON export formats for CBO qualitative cross-validation (Objective 2).

- [x] **Phase 5: Academic Rigor, GIS Spatial Analytics & Ubuntu Governance**
  - Built interactive GIS Spatial Risk & Discourse Prevalence Map (`/map`) across all 11 sub-counties of Narok and Kajiado.
  - Implemented Stratified 5-Fold Cross-Validation & Model Architecture Comparative Benchmark (`/benchmark`) tracking the thesis target ($F_1 \ge 0.75$).
  - Developed Ubuntu Communal Consent & SHA-256 Cryptographic Audit Ledger (`/ethics`) with Kenya DPA 2019 compliance and Right-to-be-Forgotten consent revocation.
  - Implemented Oral Audio Interview Recording and transcription capture for field workers.
  - Integrated Interactive Explainable AI (XAI) Token Highlighter with dialect origin, weight, and qualitative translation tooltips.
  - Developed synthetic field narrative generator (`POST /api/narratives/seed-corpus`) supporting the 800+ benchmark narrative corpus.
  - Verified all 11 backend, NLP, GIS, and Ethics test suites with 0 errors.


