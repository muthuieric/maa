from fastapi.testclient import TestClient
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.nlp.classifier import classifier_engine

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Swahili" in data["bilingual_support"]
    assert "Maa" in data["bilingual_support"]

def test_consent_gate_enforcement():
    """Objective 3: Verify that submissions without consent are strictly rejected (HTTP 400)."""
    payload = {
        "narrative": "Wasichana wengi wanalazimishwa kuolewa wakiwa na miaka kumi na minne.",
        "language": "Swahili",
        "age_band": "Under 18",
        "gender": "Female",
        "sub_county": "Narok North",
        "source_org": "Tareto Africa Trust",
        "label": "Child marriage",
        "consent_given": False # Missing consent
    }
    response = client.post("/api/narratives/submit", json=payload)
    assert response.status_code == 400
    assert "consent is mandatory" in response.json()["detail"].lower()

def test_swahili_fgm_submission():
    """Objective 1 & 2: Test Swahili narrative analysis for FGM discourse."""
    payload = {
        "narrative": "Katika kijiji chetu, ngariba alikuja kufanya mila ya tohara ya wasichana kabla ya sherehe ya ukeketaji.",
        "language": "Swahili",
        "age_band": "18-25",
        "gender": "Female",
        "sub_county": "Narok South",
        "source_org": "Tareto Africa Trust",
        "label": "FGM",
        "consent_given": True
    }
    response = client.post("/api/narratives/submit", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "narrative_id" in data
    analysis = data["analysis"]
    assert analysis["prediction_label"] == "FGM"
    assert analysis["prediction_score"] > 0.5
    assert len(analysis["detected_markers"]) > 0

def test_maa_child_marriage_submission():
    """Objective 1 & 2: Test Maa narrative analysis for early betrothal and bride wealth discourse."""
    payload = {
        "narrative": "Entito ena kake eing'uaa sukulu amu eitasheyie enkaputi o inkishu pee aaku esiankiki.",
        "language": "Maa",
        "age_band": "Under 18",
        "gender": "Female",
        "sub_county": "Kajiado Central",
        "source_org": "Tareto Africa Trust",
        "label": "Child marriage",
        "consent_given": True
    }
    response = client.post("/api/narratives/submit", json=payload)
    assert response.status_code == 201
    data = response.json()
    analysis = data["analysis"]
    assert analysis["prediction_label"] == "Child marriage"
    assert any(m["term"] in ["esiankiki", "enkaputi", "inkishu"] for m in analysis["detected_markers"])

def test_advocacy_stance_detection():
    """Test counter-narrative / advocacy stance classification."""
    payload = {
        "narrative": "Tunapinga ukeketaji na tunalinda haki za watoto na haki ya mtoto wa kike kupata elimu badala ya tohara.",
        "language": "Swahili",
        "age_band": "26-40",
        "gender": "Female",
        "sub_county": "Narok North",
        "source_org": "Tareto Africa Trust",
        "label": "FGM",
        "consent_given": True
    }
    response = client.post("/api/narratives/submit", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "Challenging" in data["analysis"]["discourse_stance"]

def test_stats_and_export():
    """Test statistics calculation and dual CSV/JSON data export."""
    # Stats
    stats_res = client.get("/api/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_narratives"] >= 3
    assert stats["consent_compliance_rate"] == 1.0

    # JSON Export
    export_json = client.get("/api/export?format=json")
    assert export_json.status_code == 200
    assert len(export_json.json()) >= 3

    # CSV Export
    export_csv = client.get("/api/export?format=csv")
    assert export_csv.status_code == 200
    assert "text/csv" in export_csv.headers["content-type"]
    assert "narrative_id" in export_csv.text

def test_backward_compatible_paper_routes():
    """Ensure original endpoints /submit and /export from the paper work seamlessly."""
    payload = {
        "narrative": "Kuozwa kwa mtoto mdogo na ndoa za mapema zinaharibu maisha yake.",
        "language": "Swahili",
        "age_band": "Under 18",
        "gender": "Female",
        "sub_county": "Kajiado East",
        "source_org": "Tareto Africa Trust",
        "label": "Child marriage",
        "consent_given": True
    }
    res_submit = client.post("/submit", json=payload)
    assert res_submit.status_code == 201

    res_export = client.get("/export?format=json")
    assert res_export.status_code == 200

def test_batch_import_and_cohens_kappa():
    """Objective 2 & 3: Test batch import from CBO, consent checking, and Cohen's Kappa evaluation."""
    batch_payload = {
        "source_org": "Tareto Africa Trust",
        "narratives": [
            {
                "narrative": "Wasichana walilazimishwa kufanyiwa ukeketaji na ngariba katika kijiji.",
                "language": "Swahili",
                "age_band": "18-25",
                "gender": "Female",
                "sub_county": "Narok North",
                "source_org": "Tareto Africa Trust",
                "label": "FGM",
                "consent_given": True
            },
            {
                "narrative": "Entito eitasheyie enkaputi o inkishu pee aaku esiankiki to olosho.",
                "language": "Maa",
                "age_band": "Under 18",
                "gender": "Female",
                "sub_county": "Kajiado Central",
                "source_org": "Tareto Africa Trust",
                "label": "Child marriage",
                "consent_given": True
            },
            {
                "narrative": "Mila hii haina ridhaa ya msimulizi kwa hivyo haipaswi kuingizwa.",
                "language": "Swahili",
                "age_band": "26-40",
                "gender": "Female",
                "sub_county": "Narok South",
                "source_org": "Tareto Africa Trust",
                "label": "Other",
                "consent_given": False # Missing consent -> rejected
            }
        ]
    }
    res = client.post("/api/narratives/batch-import", json=batch_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["total_submitted"] == 3
    assert data["imported_count"] == 2
    assert data["rejected_count"] == 1
    report = data["validation_report"]
    assert "accuracy" in report
    assert "cohens_kappa" in report
    assert report["total_evaluated"] == 2

    # Corpus validation report check
    corpus_res = client.get("/api/narratives/validation-report")
    assert corpus_res.status_code == 200
    assert corpus_res.json()["total_evaluated"] >= 2

def test_corpus_seeder_and_heatmap():
    """Test synthetic corpus generator and GIS geographic risk heatmap."""
    seed_res = client.post("/api/narratives/seed-corpus?count=15")
    assert seed_res.status_code == 200
    assert seed_res.json()["narratives_seeded"] == 15

    map_res = client.get("/api/narratives/geographic-heatmap")
    assert map_res.status_code == 200
    data = map_res.json()
    assert len(data["data_points"]) == 11
    assert any(pt["county"] == "Narok" for pt in data["data_points"])
    assert any(pt["county"] == "Kajiado" for pt in data["data_points"])

def test_kfold_cross_validation():
    """Objective 1 & 2: Test Stratified 5-Fold Cross Validation."""
    kfold_res = client.get("/api/narratives/kfold-benchmark?k=5")
    assert kfold_res.status_code == 200
    data = kfold_res.json()
    assert data["status"] == "completed"
    assert data["k_folds"] == 5
    assert len(data["folds"]) == 5
    assert "mean_macro_f1" in data

def test_ethics_audit_ledger_and_revocation():
    """Objective 3: Test Ubuntu SHA-256 consent fingerprint audit ledger and right-to-be-forgotten."""
    ledger_res = client.get("/api/ethics/audit-ledger")
    assert ledger_res.status_code == 200
    ledger_data = ledger_res.json()
    assert ledger_data["total_audited_records"] > 0
    first_record = ledger_data["audit_ledger"][0]
    assert "cryptographic_hash" in first_record
    assert len(first_record["cryptographic_hash"]) == 64  # SHA-256 hex length
    assert "ubuntu_communal_trust" in first_record["framework_compliance"]

    # Test consent revocation
    nid = first_record["narrative_id"]
    revoke_res = client.post(f"/api/ethics/withdraw-consent/{nid}")
    assert revoke_res.status_code == 200
    assert revoke_res.json()["status"] == "revoked"

def test_bilingual_lexicon_api():
    """Test lexicon retrieval and field dialect term registration."""
    lex_res = client.get("/api/lexicon")
    assert lex_res.status_code == 200
    data = lex_res.json()
    assert "maa" in data
    assert "swahili" in data
    assert data["maa"]["total_terms"] > 0
    assert data["swahili"]["total_terms"] > 0

    # Test adding term
    post_res = client.post("/api/lexicon/term", json={
        "language": "Maa",
        "category": "fgm",
        "term": "enkipoloo",
        "meaning": "Traditional girl transition rite",
        "weight": 0.88
    })
    assert post_res.status_code in [200, 201]

def test_architecture_comparison():
    """Objective 1: Verify comparative evaluation across 3 NLP architectures."""
    payload = {
        "text": "Eisho ilpayiani entito emuratare to olosho le Narok, kake CBO etegelu aituwei.",
        "language": "Maa"
    }
    response = client.post("/api/narratives/compare-architectures", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "architectures" in data
    assert len(data["architectures"]) == 3
    names = [a["name"] for a in data["architectures"]]
    assert any("AfroXML-R" in n or "Transformer" in n for n in names)
    assert any("Bi-LSTM" in n for n in names)
    assert any("Baseline" in n for n in names)




