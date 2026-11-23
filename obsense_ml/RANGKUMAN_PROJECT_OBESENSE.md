# Rangkuman Diskusi & Dokumentasi Project: ObeSense (Prediksi Tingkat Obesitas)

Dokumen ini merangkum seluruh diskusi, evaluasi metodologi, perbaikan kode, hasil eksperimen, hingga argumen presentasi untuk Project Akhir Semester **ObeSense** (`obesense.ipynb`).

---

## 1. Latar Belakang Masalah & Evaluasi Awal

Pada tahap awal, terdapat dua versi notebook yang dievaluasi:
1. **`obesense.ipynb` (Versi Awal)**:
   - Berisi *Exploratory Data Analysis* (EDA) lengkap (Histogram, Scatterplot, Boxplot, Correlation Heatmap), *Pipeline Preprocessing*, *Hyperparameter Tuning* (`RandomizedSearchCV`), *Cross-Validation*, dan *Feature Importance*.
   - **Kendala**: Hasil *Heatmap Korelasi* dan *Feature Importance* masih sangat didominasi oleh fitur fisik **`Weight`** dan **`Height`**. Selain itu, hasil *Hyperparameter Tuning* awal belum melampaui akurasi model *default* (tertahan di ~93.14% karena rentang `min_samples_leaf` terlalu besar).
2. **`obsense1.ipynb` (Eksperimen Lanjutan)**:
   - Memperkenalkan **Eksperimen A/B Testing (*Ablation Study*)** yang membandingkan model dengan `Height & Weight` vs tanpa `Height & Weight` (*Lifestyle-Only*), penggunaan `class_weight='balanced'`, serta analisis **Explainable AI (SHAP)**.

### Mengapa Project Ini Sangat Aman untuk Project Akhir Semester?
- **Menjawab Masalah *Target Leakage* / Dominasi Rumus BMI**: Pada dataset *Obesity Levels*, label target (`NObeyesdad`) secara klinis ditentukan dari rumus matematis Indeks Massa Tubuh ($BMI = \frac{\text{Weight}}{\text{Height}^2}$). Menyadari hal ini dan mengujinya lewat *Ablation Study* (menghapus `Height` dan `Weight`) menunjukkan kemampuan berpikir kritis tingkat tinggi.
- **Arsitektur Pipeline yang Bebas *Data Leakage***: Menggunakan `Pipeline` dan `ColumnTransformer` yang memisahkan perlakuan fitur Numerik, Kategorikal Nominal, dan Kategorikal Ordinal.
- **Penggunaan Explainable AI (SHAP)**: Memberikan interpretasi non-linear yang jauh lebih mendalam dibandingkan sekadar korelasi linear (*Pearson Correlation Heatmap*).

---

## 2. Penyempurnaan yang Dilakukan pada Notebook Final (`obesense.ipynb`)

Kedua notebook telah digabungkan dan disempurnakan ke dalam satu file utuh di **`obesense.ipynb`** dengan tahapan berikut:

### A. Pembersihan Data & EDA
- **Data Duplikat**: Ditemukan dan dihapus **24 baris duplikat** dari dataset awal (`2111` baris $\rightarrow$ `2087` baris bersih).
- **Missing Values**: Dipastikan `0` *missing values* di seluruh 17 kolom.
- **Visualisasi Korelasi terhadap Target**: Pada *Heatmap Korelasi*, kelas `NObeyesdad` dipetakan secara berurutan (`0` = *Insufficient Weight* s/d `6` = *Obesity Type III*) sehingga terbukti secara kuantitatif bahwa `Weight` memiliki korelasi linear $r = 0.91$ terhadap tingkat obesitas.

### B. Preprocessing Pipeline (`ColumnTransformer`)
1. **Fitur Numerik**: `SimpleImputer(strategy='median')` + `StandardScaler()`
2. **Fitur Kategorikal Nominal** (`Gender`, `family_history_with_overweight`, `FAVC`, `SMOKE`, `SCC`, `MTRANS`): `SimpleImputer(strategy='most_frequent')` + `OneHotEncoder(handle_unknown='ignore')`
3. **Fitur Kategorikal Ordinal** (`CAEC`, `CALC` dengan urutan `['no', 'Sometimes', 'Frequently', 'Always']`): `SimpleImputer(strategy='most_frequent')` + `OrdinalEncoder`

### C. Hasil Eksperimen A/B Testing & Hyperparameter Tuning (`RandomizedSearchCV` 5-Fold Stratified CV)

| Model & Skenario | Fitur yang Digunakan | 5-Fold CV F1-Score | Test Accuracy | Test Weighted F1-Score | Error Rate (Misclassified) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Logistic Regression (Baseline - Skenario A)** | Full (16 Fitur, termasuk `Height` & `Weight`) | - | 86.36% | 0.8617 | 13.64% |
| **Logistic Regression (Baseline - Skenario B)** | Lifestyle-Only (14 Fitur, tanpa `Height` & `Weight`) | - | 56.46% | 0.5562 | 43.54% |
| **Random Forest (Baseline - Skenario A)** | Full (16 Fitur, termasuk `Height` & `Weight`) | - | 94.74% | 0.9478 | 5.26% |
| **Random Forest (Baseline - Skenario B)** | Lifestyle-Only (14 Fitur, tanpa `Height` & `Weight`) | - | 84.93% | 0.8490 | 15.07% |
| **Random Forest (Tuned - Skenario A)** | **Full (16 Fitur, termasuk `Height` & `Weight`)** | **0.9471** | **96.41%** | **0.9641** | **3.59% (15 / 418 sampel)** |
| **Random Forest (Tuned - Skenario B)** | **Lifestyle-Only (14 Fitur, tanpa `Height` & `Weight`)** | **0.8454** | **85.65%** | **0.8560** | **14.35% (60 / 418 sampel)** |

**Parameter Terbaik Hasil Tuning:**
- **Skenario A (Full Features)**: `n_estimators=100`, `max_depth=30`, `min_samples_split=2`, `min_samples_leaf=2`, `max_features=None`, `class_weight='balanced'`
- **Skenario B (Lifestyle-Only)**: `n_estimators=100`, `max_depth=25`, `min_samples_split=3`, `min_samples_leaf=1`, `max_features='log2'`, `class_weight='balanced_subsample'`

### D. Temuan Explainable AI (Feature Importance & SHAP Analysis)
- **Pada Skenario A (Full Features)**: Grafik *Feature Importance* dan *SHAP Summary Plot* membuktikan bahwa `Weight` dan `Height` mendominasi prediksi model secara ekstrem.
- **Pada Skenario B (Tanpa `Height` & `Weight`)**: Ketika bias BMI dihilangkan, analisis SHAP berhasil menyingkap faktor gaya hidup dan demografi yang paling memengaruhi risiko obesitas, yaitu:
  1. **`Age`** (Usia)
  2. **`FCVC`** (Frekuensi konsumsi sayur-sayuran)
  3. **`NCP`** (Jumlah makan utama per hari)
  4. **`family_history_with_overweight`** (Riwayat keluarga dengan kelebihan berat badan)
  5. **`FAF`** (Frekuensi aktivitas fisik / olahraga)
  6. **`TUE`** (Waktu penggunaan perangkat teknologi / *screen time*)

---

## 3. Strategi & Argumen: Lebih Baik Menggunakan BMI (`Height` & `Weight`) atau Tidak?

**Rekomendasi Terbaik:**
**Pertahankan komparasi kedua skenario (Skenario A vs Skenario B) di dalam laporan dan notebook, namun jadikan Skenario B (Tanpa `Height` & `Weight` / *Lifestyle-Only*) sebagai sorotan utama nilai risetmu.**

### Poin Argumen untuk Presentasi ke Dosen:
1. **Mengapa tidak hanya menggunakan BMI (`Height` & `Weight`)?**
   - Karena label target `NObeyesdad` diturunkan langsung dari rumus BMI ($\text{Weight} / \text{Height}^2$). Jika hanya mengandalkan berat dan tinggi badan, sistem tidak memerlukan *Machine Learning* (cukup rumus kalkulator BMI biasa). Selain itu, kehadiran `Weight` dan `Height` menutupi pengaruh variabel gaya hidup pada analisis *feature importance*.
2. **Mengapa tidak langsung menghapus `Height` & `Weight` tanpa menampilkan Skenario A?**
   - Dengan tetap menampilkan **Skenario A (Akurasi 96.41%)**, kita membuktikan kepada penguji bahwa pipeline preprocessing dan *hyperparameter tuning* yang kita bangun sudah sangat optimal dan mampu mencapai akurasi standar tertinggi pada dataset tersebut.
3. **Apa nilai jual utama dari Skenario B (Tanpa `Height` & `Weight` - Akurasi 85.65%)?**
   - Skenario B menjawab pertanyaan riset yang jauh lebih bermakna: *"Seberapa akurat kita bisa memprediksi risiko obesitas seseorang MURNI dari kebiasaan hidupnya tanpa menimbang berat badan?"*
   - Terbukti model non-linear (*Random Forest Tuned*) mampu mencapai **85.65%** (dibanding *Logistic Regression* yang hanya 56.46%), dan bersama **SHAP Analysis**, model ini bisa digunakan untuk memberikan rekomendasi perubahan gaya hidup secara spesifik (seperti peningkatan aktivitas fisik `FAF` dan konsumsi sayur `FCVC`).

---

## 4. Catatan Terminologi Penting
- Gunakan istilah **"Hyperparameter Tuning"** (bukan *Fine-Tuning*) saat menjelaskan proses pencarian parameter terbaik dengan `RandomizedSearchCV` pada model *Random Forest*, karena istilah *fine-tuning* dalam literatur ilmiah lebih spesifik merujuk pada pelatihan ulang *pre-trained neural networks / Deep Learning*.
