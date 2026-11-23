"""
Training script untuk OBSENSE Prediction Service (Fase 4 / Issue #1).

Melatih dan menyimpan dua pipeline Random Forest hasil Hyperparameter Tuning
sesuai RANGKUMAN_PROJECT_OBESENSE.md:
  - Skenario A (Full Features - 16 fitur, termasuk Height & Weight)
  - Skenario B (Lifestyle-Only - 14 fitur, tanpa Height & Weight)

Menghasilkan:
  - models/pipeline_full.joblib
  - models/pipeline_lifestyle.joblib
  - models/metadata.json  (metrik A/B testing, feature importance, korelasi)
"""

import json
import os
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder, StandardScaler

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "ObesityDataSet_raw_and_data_sinthetic.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")

TARGET_COL = "NObeyesdad"

OBESITY_ORDER = [
    "Insufficient_Weight",
    "Normal_Weight",
    "Overweight_Level_I",
    "Overweight_Level_II",
    "Obesity_Type_I",
    "Obesity_Type_II",
    "Obesity_Type_III",
]

NUMERIC_FULL = ["Age", "Height", "Weight", "FCVC", "NCP", "CH2O", "FAF", "TUE"]
NUMERIC_LIFESTYLE = ["Age", "FCVC", "NCP", "CH2O", "FAF", "TUE"]
NOMINAL_FEATURES = [
    "Gender",
    "family_history_with_overweight",
    "FAVC",
    "SMOKE",
    "SCC",
    "MTRANS",
]
ORDINAL_FEATURES = ["CAEC", "CALC"]
ORDINAL_CATEGORIES = [
    ["no", "Sometimes", "Frequently", "Always"],
    ["no", "Sometimes", "Frequently", "Always"],
]

FEATURE_LABELS = {
    "Weight": ("Weight (Berat Badan)", "Antropometri"),
    "Height": ("Height (Tinggi Badan)", "Antropometri"),
    "Age": ("Age (Usia)", "Demografi"),
    "Gender": ("Gender (Jenis Kelamin)", "Demografi"),
    "family_history_with_overweight": ("Riwayat Keluarga Obesitas", "Demografi"),
    "FCVC": ("FCVC (Frekuensi Sayur)", "Pola Makan"),
    "NCP": ("NCP (Jumlah Makan Utama)", "Pola Makan"),
    "FAVC": ("FAVC (Makanan Tinggi Kalori)", "Pola Makan"),
    "CH2O": ("CH2O (Konsumsi Air)", "Pola Makan"),
    "CAEC": ("CAEC (Kebiasaan Ngemil)", "Pola Makan"),
    "CALC": ("CALC (Konsumsi Alkohol)", "Pola Makan"),
    "SCC": ("SCC (Pantau Kalori)", "Pola Makan"),
    "FAF": ("FAF (Aktivitas Fisik)", "Gaya Hidup"),
    "TUE": ("TUE (Screen Time)", "Gaya Hidup"),
    "SMOKE": ("SMOKE (Merokok)", "Gaya Hidup"),
    "MTRANS": ("MTRANS (Transportasi)", "Gaya Hidup"),
}


def build_preprocessor(numeric_cols):
    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    nominal_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )
    ordinal_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "ordinal",
                OrdinalEncoder(
                    categories=ORDINAL_CATEGORIES,
                    handle_unknown="use_encoded_value",
                    unknown_value=-1,
                ),
            ),
        ]
    )
    return ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_cols),
            ("nom", nominal_transformer, NOMINAL_FEATURES),
            ("ord", ordinal_transformer, ORDINAL_FEATURES),
        ]
    )


def map_transformed_feature_to_parent(transformed_name, original_cols):
    """Petakan nama kolom hasil ColumnTransformer (mis. nom__MTRANS_Walking) ke fitur asal."""
    clean = transformed_name.split("__", 1)[-1]
    if clean in original_cols:
        return clean
    for col in sorted(original_cols, key=len, reverse=True):
        if clean.startswith(col + "_"):
            return col
    return clean


def aggregate_feature_importances(pipeline, original_cols):
    """Gabungkan bobot feature importance one-hot kembali ke fitur asal."""
    preprocessor = pipeline.named_steps["preprocessor"]
    model = pipeline.named_steps["model"]
    transformed_names = preprocessor.get_feature_names_out()
    importances = model.feature_importances_

    grouped = {}
    for t_name, imp in zip(transformed_names, importances):
        parent = map_transformed_feature_to_parent(t_name, original_cols)
        grouped[parent] = grouped.get(parent, 0.0) + float(imp)

    total = sum(grouped.values()) or 1.0
    result = []
    for key, val in sorted(grouped.items(), key=lambda x: x[1], reverse=True):
        label, category = FEATURE_LABELS.get(key, (key, "Lainnya"))
        result.append(
            {
                "key": key,
                "feature": label,
                "weight": round(val / total, 4),
                "category": category,
            }
        )
    return result


def compute_correlation_matrix(df):
    """Hitung korelasi Pearson fitur utama terhadap NObeyesdad (ordinal 0..6)."""
    work = df.copy()
    work["target_num"] = work[TARGET_COL].map({k: i for i, k in enumerate(OBESITY_ORDER)})
    for col in ["FAVC", "family_history_with_overweight", "SCC", "SMOKE"]:
        work[col + "_num"] = (work[col].astype(str).str.lower() == "yes").astype(int)

    corr_specs = [
        ("Weight", "Weight", "Weight (Berat Badan)", "Korelasi linear sangat kuat karena label berasal dari rumus BMI"),
        ("family_history_with_overweight", "family_history_with_overweight_num", "Riwayat Keluarga Obesitas", "Faktor risiko genetik & lingkungan keluarga"),
        ("FAVC", "FAVC_num", "FAVC (Makanan Tinggi Kalori)", "Konsumsi makanan tinggi kalori/fast food berkorelasi positif dengan obesitas"),
        ("Age", "Age", "Age (Usia)", "Risiko obesitas cenderung meningkat seiring pertambahan usia"),
        ("FCVC", "FCVC", "FCVC (Konsumsi Sayur)", "Pola konsumsi sayur berkorelasi non-linear dengan kelas obesitas"),
        ("CH2O", "CH2O", "CH2O (Konsumsi Air)", "Kebutuhan cairan meningkat pada berat badan lebih tinggi"),
        ("FAF", "FAF", "FAF (Aktivitas Fisik)", "Makin tinggi aktivitas fisik, makin rendah risiko obesitas"),
        ("TUE", "TUE", "TUE (Screen Time)", "Penggunaan perangkat teknologi memengaruhi gaya hidup sedentari"),
    ]

    items = []
    for key, col, label, notes in corr_specs:
        r = float(work[col].corr(work["target_num"]))
        if np.isnan(r):
            r = 0.0
        if r >= 0.4:
            impact = "Faktor Risiko Utama"
        elif r >= 0.15:
            impact = "Faktor Risiko"
        elif r <= -0.15:
            impact = "Protektif"
        else:
            impact = "Korelasi Lemah / Non-Linear"
        items.append(
            {
                "key": key,
                "feature": label,
                "correlationWithObesity": round(r, 2),
                "impact": impact,
                "notes": notes,
            }
        )
    return items


def train_and_save():
    os.makedirs(MODELS_DIR, exist_ok=True)
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset tidak ditemukan: {DATASET_PATH}")

    raw_df = pd.read_csv(DATASET_PATH)
    raw_rows = len(raw_df)
    df = raw_df.drop_duplicates().reset_index(drop=True)
    clean_rows = len(df)

    y = df[TARGET_COL]
    X_full = df.drop(columns=[TARGET_COL])
    X_life = X_full.drop(columns=["Height", "Weight"])

    X_tr_f, X_te_f, y_tr, y_te = train_test_split(
        X_full, y, test_size=0.2, random_state=42, stratify=y
    )
    X_tr_l = X_tr_f.drop(columns=["Height", "Weight"])
    X_te_l = X_te_f.drop(columns=["Height", "Weight"])

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # --- Baseline models (untuk tabel perbandingan A/B Testing) ---
    experiments = []

    def eval_experiment(name, scenario, feature_count, pipe, X_tr, X_te, compute_cv=False):
        cv_f1 = None
        if compute_cv:
            scores = cross_val_score(pipe, X_tr, y_tr, cv=cv, scoring="f1_weighted", n_jobs=-1)
            cv_f1 = round(float(scores.mean()), 4)
        pipe.fit(X_tr, y_tr)
        preds = pipe.predict(X_te)
        acc = float(accuracy_score(y_te, preds))
        f1 = float(f1_score(y_te, preds, average="weighted"))
        err_count = int((preds != y_te).sum())
        experiments.append(
            {
                "model": name,
                "scenario": scenario,
                "feature_count": feature_count,
                "cv_f1_score": cv_f1,
                "test_accuracy": round(acc * 100, 2),
                "test_f1_score": round(f1, 4),
                "error_rate": round((1.0 - acc) * 100, 2),
                "misclassified": err_count,
                "test_samples": len(y_te),
            }
        )
        return pipe

    eval_experiment(
        "Logistic Regression (Baseline)",
        "A (Full)",
        16,
        Pipeline([("preprocessor", build_preprocessor(NUMERIC_FULL)), ("model", LogisticRegression(max_iter=1000, class_weight="balanced"))]),
        X_tr_f,
        X_te_f,
    )
    eval_experiment(
        "Logistic Regression (Baseline)",
        "B (Lifestyle-Only)",
        14,
        Pipeline([("preprocessor", build_preprocessor(NUMERIC_LIFESTYLE)), ("model", LogisticRegression(max_iter=1000, class_weight="balanced"))]),
        X_tr_l,
        X_te_l,
    )
    eval_experiment(
        "Random Forest (Baseline)",
        "A (Full)",
        16,
        Pipeline([("preprocessor", build_preprocessor(NUMERIC_FULL)), ("model", RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced"))]),
        X_tr_f,
        X_te_f,
    )
    eval_experiment(
        "Random Forest (Baseline)",
        "B (Lifestyle-Only)",
        14,
        Pipeline([("preprocessor", build_preprocessor(NUMERIC_LIFESTYLE)), ("model", RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced"))]),
        X_tr_l,
        X_te_l,
    )

    # --- Tuned Models (Parameter terbaik hasil RandomizedSearchCV) ---
    rf_tuned_full = RandomForestClassifier(
        n_estimators=100,
        max_depth=30,
        min_samples_split=2,
        min_samples_leaf=2,
        max_features=None,
        class_weight="balanced",
        random_state=42,
    )
    pipeline_full = eval_experiment(
        "Random Forest (Tuned)",
        "A (Full)",
        16,
        Pipeline([("preprocessor", build_preprocessor(NUMERIC_FULL)), ("model", rf_tuned_full)]),
        X_tr_f,
        X_te_f,
        compute_cv=True,
    )

    rf_tuned_lifestyle = RandomForestClassifier(
        n_estimators=100,
        max_depth=25,
        min_samples_split=3,
        min_samples_leaf=1,
        max_features="log2",
        class_weight="balanced_subsample",
        random_state=42,
    )
    pipeline_lifestyle = eval_experiment(
        "Random Forest (Tuned)",
        "B (Lifestyle-Only)",
        14,
        Pipeline([("preprocessor", build_preprocessor(NUMERIC_LIFESTYLE)), ("model", rf_tuned_lifestyle)]),
        X_tr_l,
        X_te_l,
        compute_cv=True,
    )

    # Simpan model joblib
    full_path = os.path.join(MODELS_DIR, "pipeline_full.joblib")
    life_path = os.path.join(MODELS_DIR, "pipeline_lifestyle.joblib")
    joblib.dump(pipeline_full, full_path)
    joblib.dump(pipeline_lifestyle, life_path)

    metadata = {
        "dataset": {
            "source": "ObesityDataSet_raw_and_data_sinthetic.csv",
            "raw_rows": raw_rows,
            "duplicates_removed": raw_rows - clean_rows,
            "clean_rows": clean_rows,
            "train_rows": len(X_tr_f),
            "test_rows": len(X_te_f),
            "classes": OBESITY_ORDER,
        },
        "models": {
            "scenario_a_full": {
                "version": "obsense-rf-tuned-full-v2",
                "feature_count": 16,
                "metrics": experiments[-2],
            },
            "scenario_b_lifestyle": {
                "version": "obsense-rf-tuned-lifestyle-v2",
                "feature_count": 14,
                "metrics": experiments[-1],
            },
        },
        "ab_experiments": experiments,
        "feature_importance": {
            "scenario_a_full": aggregate_feature_importances(pipeline_full, list(X_full.columns)),
            "scenario_b_lifestyle": aggregate_feature_importances(pipeline_lifestyle, list(X_life.columns)),
        },
        "correlation_matrix": compute_correlation_matrix(df),
    }

    meta_path = os.path.join(MODELS_DIR, "metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"Training selesai. Dataset: {raw_rows} -> {clean_rows} baris bersih.")
    print(f"  Skenario A (Full)          : Test Accuracy = {experiments[-2]['test_accuracy']}% | F1 = {experiments[-2]['test_f1_score']}")
    print(f"  Skenario B (Lifestyle-Only): Test Accuracy = {experiments[-1]['test_accuracy']}% | F1 = {experiments[-1]['test_f1_score']}")
    return metadata


if __name__ == "__main__":
    train_and_save()
