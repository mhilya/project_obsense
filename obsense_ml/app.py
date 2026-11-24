"""
OBSENSE Prediction Service (Fase 4 / Issue #1)
Port default: 5001 (diakses lewat API Gateway :4000 pada prefix /api/predict).

Menyediakan:
  - GET  /health
  - GET  /api/predict/metadata
  - POST /api/predict
"""

import json
import os
import warnings

import joblib
import numpy as np
import pandas as pd
import shap
from flask import Flask, jsonify, request
from flask_cors import CORS

from train import (
    FEATURE_LABELS,
    MODELS_DIR,
    NOMINAL_FEATURES,
    NUMERIC_FULL,
    NUMERIC_LIFESTYLE,
    OBESITY_ORDER,
    ORDINAL_FEATURES,
    map_transformed_feature_to_parent,
    train_and_save,
)

warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

RISK_MAP = {
    "Insufficient_Weight": "Low",
    "Normal_Weight": "Low",
    "Overweight_Level_I": "Moderate",
    "Overweight_Level_II": "Moderate",
    "Obesity_Type_I": "High",
    "Obesity_Type_II": "High",
    "Obesity_Type_III": "Critical",
}

ORDINAL_VALID = {"no", "Sometimes", "Frequently", "Always"}
MTRANS_VALID = {"Automobile", "Motorbike", "Bike", "Public_Transportation", "Walking"}

FULL_COLS = NUMERIC_FULL + NOMINAL_FEATURES + ORDINAL_FEATURES
LIFESTYLE_COLS = NUMERIC_LIFESTYLE + NOMINAL_FEATURES + ORDINAL_FEATURES

pipeline_full = None
pipeline_lifestyle = None
explainer_lifestyle = None
metadata = None


def load_models():
    global pipeline_full, pipeline_lifestyle, explainer_lifestyle, metadata
    full_path = os.path.join(MODELS_DIR, "pipeline_full.joblib")
    life_path = os.path.join(MODELS_DIR, "pipeline_lifestyle.joblib")
    meta_path = os.path.join(MODELS_DIR, "metadata.json")

    if not (os.path.exists(full_path) and os.path.exists(life_path) and os.path.exists(meta_path)):
        print("Model belum ditemukan, menjalankan training otomatis...")
        train_and_save()

    pipeline_full = joblib.load(full_path)
    pipeline_lifestyle = joblib.load(life_path)
    with open(meta_path, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    explainer_lifestyle = shap.TreeExplainer(pipeline_lifestyle.named_steps["model"])


def pick_key(data, *keys, default=None):
    for k in keys:
        if k in data and data[k] is not None and data[k] != "":
            return data[k]
    return default


def to_yes_no(val, default="no", threshold=0.5):
    if val is None or val == "":
        return default
    if isinstance(val, bool):
        return "yes" if val else "no"
    if isinstance(val, (int, float)):
        return "yes" if float(val) >= threshold else "no"
    s = str(val).strip().lower()
    if s in ("yes", "ya", "true", "1"):
        return "yes"
    if s in ("no", "tidak", "false", "0"):
        return "no"
    return default


def normalize_gender(val):
    if val is None or val == "":
        return "Male"
    s = str(val).strip().lower()
    if s in ("female", "perempuan", "wanita", "p"):
        return "Female"
    return "Male"


def normalize_ordinal(val, default="Sometimes"):
    if val is None or val == "":
        return default
    s = str(val).strip().lower()
    mapping = {
        "no": "no",
        "tidak": "no",
        "sometimes": "Sometimes",
        "kadang": "Sometimes",
        "frequently": "Frequently",
        "sering": "Frequently",
        "always": "Always",
        "selalu": "Always",
    }
    return mapping.get(s, val if val in ORDINAL_VALID else default)


def normalize_mtrans(val):
    if val is None or val == "":
        return "Public_Transportation"
    if val in MTRANS_VALID:
        return val
    s = str(val).strip().lower()
    mapping = {
        "automobile": "Automobile",
        "mobil": "Automobile",
        "motorbike": "Motorbike",
        "motor": "Motorbike",
        "bike": "Bike",
        "sepeda": "Bike",
        "walking": "Walking",
        "jalan": "Walking",
        "public_transportation": "Public_Transportation",
    }
    return mapping.get(s, "Public_Transportation")


def normalize_payload(body):
    """Normalisasi input dari web/mobile/assessment-service ke format fitur UCI."""
    age_raw = pick_key(body, "age", "Age", default=25)
    age = float(age_raw)
    if not (1 <= age <= 120):
        raise ValueError("age harus antara 1 sampai 120 tahun.")

    height_raw = pick_key(body, "height", "Height")
    weight_raw = pick_key(body, "weight", "Weight")
    height_m = None
    weight_kg = None
    if height_raw is not None:
        h = float(height_raw)
        if h <= 0:
            raise ValueError("height harus lebih dari 0.")
        # Konversi otomatis cm -> meter jika > 3
        height_m = round(h / 100.0, 4) if h > 3.0 else round(h, 4)
        if not (0.5 <= height_m <= 2.5):
            raise ValueError("height harus berada pada rentang 50–250 cm (0.5–2.5 m).")

    if weight_raw is not None:
        weight_kg = float(weight_raw)
        if not (10 <= weight_kg <= 400):
            raise ValueError("weight harus berada pada rentang 10–400 kg.")

    favc_raw = pick_key(body, "favc", "FAVC", "favc_ratio", default="no")
    ch2o_raw = float(pick_key(body, "ch2o", "CH2O", "ch2o_mean", default=2.0))
    faf_raw = float(pick_key(body, "faf", "FAF", "faf_mean", default=1.0))
    tue_raw = float(pick_key(body, "tue", "TUE", "tue_mean", default=1.0))
    fcvc_raw = float(pick_key(body, "fcvc", "FCVC", "fcvc_mode", default=2.0))
    ncp_raw = float(pick_key(body, "ncp", "NCP", "ncp_mean", default=3.0))

    features = {
        "Age": age,
        "Gender": normalize_gender(pick_key(body, "gender", "Gender", default="Male")),
        "Height": height_m,
        "Weight": weight_kg,
        "CALC": normalize_ordinal(pick_key(body, "calc", "CALC", "calc_mode"), default="no"),
        "FAVC": to_yes_no(favc_raw, default="no", threshold=0.5),
        "FCVC": min(max(fcvc_raw, 1.0), 3.0),
        "NCP": min(max(ncp_raw, 1.0), 4.0),
        "SCC": to_yes_no(pick_key(body, "scc", "SCC", "scc_mode"), default="no"),
        "SMOKE": to_yes_no(pick_key(body, "smoke", "SMOKE"), default="no"),
        "CH2O": min(max(ch2o_raw, 1.0), 3.0),
        "family_history_with_overweight": to_yes_no(
            pick_key(body, "family_history_with_overweight", "family_history"), default="no"
        ),
        "FAF": min(max(faf_raw, 0.0), 3.0),
        "TUE": min(max(tue_raw, 0.0), 2.0),
        "CAEC": normalize_ordinal(pick_key(body, "caec", "CAEC", "caec_mode"), default="Sometimes"),
        "MTRANS": normalize_mtrans(pick_key(body, "mtrans", "MTRANS", "mtrans_mode")),
    }
    return features


def predict_with_pipeline(pipe, df_row, version):
    pred_class = str(pipe.predict(df_row)[0])
    probs_raw = pipe.predict_proba(df_row)[0]
    classes = list(pipe.named_steps["model"].classes_)
    prob_map = {cls: round(float(p), 4) for cls, p in zip(classes, probs_raw)}
    ordered_probs = {cls: prob_map.get(cls, 0.0) for cls in OBESITY_ORDER}
    return {
        "obesity_class": pred_class,
        "risk_level": RISK_MAP.get(pred_class, "Low"),
        "probability_scores": ordered_probs,
        "model_version": version,
    }


def compute_lifestyle_shap(df_life, predicted_class):
    """Hitung kontribusi SHAP lokal pada Skenario B (Lifestyle-Only) untuk kelas terprediksi."""
    preprocessor = pipeline_lifestyle.named_steps["preprocessor"]
    model = pipeline_lifestyle.named_steps["model"]
    X_trans = preprocessor.transform(df_life)
    transformed_names = preprocessor.get_feature_names_out()

    shap_vals = explainer_lifestyle.shap_values(X_trans)
    class_idx = list(model.classes_).index(predicted_class)

    if isinstance(shap_vals, list):
        class_shap = np.asarray(shap_vals[class_idx])[0]
    elif np.ndim(shap_vals) == 3:
        class_shap = shap_vals[0, :, class_idx]
    else:
        class_shap = np.asarray(shap_vals)[0]

    grouped = {}
    for t_name, val in zip(transformed_names, class_shap):
        parent = map_transformed_feature_to_parent(t_name, LIFESTYLE_COLS)
        grouped[parent] = grouped.get(parent, 0.0) + float(val)

    factors = []
    for key, val in sorted(grouped.items(), key=lambda x: abs(x[1]), reverse=True)[:5]:
        label, category = FEATURE_LABELS.get(key, (key, "Gaya Hidup"))
        factors.append(
            {
                "feature": key,
                "label": label,
                "category": category,
                "shap_value": round(val, 4),
                "impact": "risk_up" if val >= 0 else "protective",
            }
        )
    return factors


def generate_recommendations(features, risk_level):
    recs = []
    if features["FAF"] < 1.5:
        recs.append("Tingkatkan aktivitas fisik (FAF) menjadi minimal 150 menit olahraga sedang per minggu.")
    if features["FCVC"] < 2.5:
        recs.append("Tambahkan porsi sayur dan buah pada setiap waktu makan utama (target FCVC skala 3).")
    if features["TUE"] >= 1.5:
        recs.append("Kurangi waktu layar/screen time (TUE) dan selingi dengan peregangan setiap 1 jam.")
    if features["FAVC"] == "yes":
        recs.append("Batasi konsumsi makanan tinggi kalori, gorengan, dan makanan cepat saji (FAVC).")
    if features["CH2O"] < 2.0:
        recs.append("Tingkatkan konsumsi air putih harian menjadi minimal 2 liter per hari (CH2O).")
    if features["CAEC"] in ("Frequently", "Always"):
        recs.append("Kurangi frekuensi ngemil di antara waktu makan utama (CAEC) atau ganti dengan buah/kacang.")
    if features["SMOKE"] == "yes":
        recs.append("Pertimbangkan program berhenti merokok untuk menurunkan risiko komorbiditas metabolik.")
    if risk_level in ("High", "Critical"):
        recs.append("Disarankan konsultasi langsung dengan dokter atau ahli gizi untuk evaluasi klinis terukur.")
    if not recs:
        recs.append("Pertahankan pola makan seimbang, hidrasi cukup, dan aktivitas fisik rutin Anda saat ini.")
    return recs


@app.get("/health")
def health():
    return jsonify(
        {
            "service": "prediction-service",
            "status": "OK",
            "models_loaded": pipeline_full is not None and pipeline_lifestyle is not None,
            "scenarios": ["scenario_a_full", "scenario_b_lifestyle"],
        }
    )


@app.get("/api/predict/metadata")
def get_metadata():
    return jsonify({"success": True, "data": metadata})


@app.post("/api/predict")
def predict():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return jsonify({"message": "Body JSON tidak valid."}), 400

    try:
        features = normalize_payload(body)
    except (ValueError, TypeError) as err:
        return jsonify({"message": str(err)}), 400

    # Skenario B (Lifestyle-Only) selalu dijalankan
    df_life = pd.DataFrame([{k: features[k] for k in LIFESTYLE_COLS}])
    life_ver = metadata["models"]["scenario_b_lifestyle"]["version"]
    scenario_b = predict_with_pipeline(pipeline_lifestyle, df_life, life_ver)

    # Skenario A (Full Features) dijalankan jika Height & Weight tersedia
    bmi = None
    if features["Height"] is not None and features["Weight"] is not None:
        bmi = round(features["Weight"] / (features["Height"] ** 2), 1)
        df_full = pd.DataFrame([{k: features[k] for k in FULL_COLS}])
        full_ver = metadata["models"]["scenario_a_full"]["version"]
        scenario_a = {"available": True, **predict_with_pipeline(pipeline_full, df_full, full_ver)}
    else:
        scenario_a = {
            "available": False,
            "reason": "Height dan weight tidak disediakan; hanya menjalankan Skenario B (Lifestyle-Only).",
        }

    # SHAP lokal dihitung dari Skenario B agar faktor gaya hidup tidak tertutup oleh BMI
    top_shap = compute_lifestyle_shap(df_life, scenario_b["obesity_class"])
    active_risk = scenario_a["risk_level"] if scenario_a.get("available") else scenario_b["risk_level"]
    recommendations = generate_recommendations(features, active_risk)

    return jsonify(
        {
            "success": True,
            "data": {
                "bmi": bmi,
                "scenario_a_full": scenario_a,
                "scenario_b_lifestyle": scenario_b,
                "top_shap_factors": top_shap,
                "recommendations": recommendations,
                "normalized_input": features,
            },
        }
    )


load_models()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"prediction-service running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
