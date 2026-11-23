# Roadmap & Progress Migrasi Microservices OBSENSE

Dokumen ini menjadi pegangan utama arsitektur, daftar fase (yang sudah selesai dan yang belum), panduan setup di device baru, serta prompt *handover* agar pengerjaan dapat langsung dilanjutkan di komputer/device lain tanpa kehilangan konteks.

---

## 1. Master Plan Arsitektur (Tanpa Docker)

Semua aplikasi klien (`obsense_web` dan `obsense_mobile`) berkomunikasi melalui satu pintu masuk (**API Gateway** pada port `4000`). Satu server MySQL lokal menjalankan **5 database terpisah** (**Database-per-Service**, tanpa *foreign key* lintas database).

```text
obsense_web (React)  ─┐
                      ├──► API Gateway (:4000)
obsense_mobile (RN)  ─┘       │
                              ├──► /api/auth            ──► auth-service (:4001)       ──► [(auth_db)]
                              ├──► /api/users           ──► user-service (:4002)       ──► [(user_db)]
                              ├──► /api/cycles          ──► assessment-service (:4003) ──► [(assessment_db)]
                              ├──► /api/assessments     ──► assessment-service (:4003) ──► [(assessment_db)]
                              ├──► /api/predict         ──► prediction-service (:5001) ──► (Python ML - Tanpa DB)
                              ├──► /api/evaluations     ──► admin-service (:4005)      ──► [(admin_db)]
                              ├──► /api/configurations  ──► admin-service (:4005)      ──► [(admin_db)]
                              └──► /api/audit           ──► audit-service (:4006)      ──► [(audit_db)]
```

### Aturan Inti Arsitektur
1. **Database-per-Service:** Setiap service hanya mengakses database miliknya sendiri.
2. **Tanpa Foreign Key Lintas Database:** Referensi seperti `user_id` atau `admin_id` di database lain disimpan sebagai `INT` biasa tanpa constraint FK ke `auth_db` maupun `user_db`.
3. **Sinkronisasi `user_id`:**
   - Akun pasien yang mendaftar dari `obsense_mobile` memiliki `user_db.users.id` yang **sama persis** dengan `auth_db.users.id` (dibuat lewat upsert `PUT /api/users/me`).
   - Pasien yang dibuat oleh admin lewat `obsense_web` memakai `AUTO_INCREMENT=100000` di `user_db.users` agar tidak bentrok dengan ID akun mobile.
4. **JWT Secret Seragam:** Semua service Node.js memverifikasi token menggunakan `JWT_SECRET` yang **wajib sama** di tiap file `.env`. Payload token berisi `{ id, email, role, name, type }` (`type`: `'user' | 'admin'`).

---

## 2. Fase yang Sudah Selesai (Fase 0 – Fase 4B / Issue #1 & #2)

### Fase 0 — Persiapan Database, Runner Lokal, & Pembersihan Data Dummy
- `scripts/init-databases.sql`: DDL untuk membuat 5 database terpisah (`auth_db`, `user_db`, `assessment_db`, `admin_db`, `audit_db`).
- `scripts/start-all.ps1`: skrip PowerShell untuk menjalankan semua service lokal (Node.js & Python) di jendela terpisah (otomatis `npm install` dan menyalin `.env.example` ke `.env` bila belum ada).
- `.gitignore`: mengabaikan `node_modules/`, `.env` (kecuali `!.env.example`), log, build output, cache/venv Python, serta biner model `obsense_ml/models/*.joblib`.
- Pembersihan data dummy transaksional di `obsense_web/src/mock/mockData.js` (`INITIAL_USERS`, `INITIAL_ASSESSMENT_CYCLES`, `INITIAL_DAILY_LOGS`, `INITIAL_ASSESSMENTS`, `INITIAL_ADMIN_EVALUATIONS`, `INITIAL_AUDIT_LOGS`, `INITIAL_LOGIN_ATTEMPTS`, `RISK_TREND_DATA` menjadi `[]`).

### Fase 1 — `auth-service` (`services/auth-service`, Port `4001`, DB `auth_db`)
- Auto-init database `auth_db` beserta tabel `users`, `admins`, dan `login_attempts` + seed awal `superadmin@obsense.com` (`SEED_ADMIN_PASSWORD`, default `admin123`).
- Endpoint akun mobile:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Endpoint admin web:
  - `POST /api/auth/admin/login`
  - Manajemen admin khusus `super_admin`: `GET /api/auth/admins`, `POST /api/auth/admins`, `PUT /api/auth/admins/:id`, `POST /api/auth/admins/:id/reset-password`

### Fase 2 — `gateway` (`services/gateway`, Port `4000`) & Auth Web
- Proxy berbasis `http-proxy-middleware` dan endpoint `GET /health` (kini meneruskan `/api/auth`, `/api/users`, `/api/cycles`, `/api/assessments`, `/api/predict`).
- Mengubah `API_BASE_URL` di `obsense_web/src/utils/constants.js` ke `http://localhost:4000/api`.
- Menghubungkan `obsense_web/src/context/AuthContext.js` (login admin & verifikasi sesi `/auth/me`) dan `obsense_web/src/pages/admins/AdminManagement.js` ke `auth-service` lewat gateway.

### Fase 3 — `user-service` (`:4002`), `assessment-service` (`:4003`), & Sinkronisasi Dashboard Web
- **`services/user-service` (Port `4002`, DB `user_db`):**
  - Tabel `users` (`AUTO_INCREMENT=100000`).
  - Endpoint mobile: `GET /api/users/me`, `PUT /api/users/me` (upsert profil, normalisasi gender `Male`/`Female` atau `Laki-laki`/`Perempuan`, hitung umur & BMI).
  - Endpoint admin web: `GET /api/users`, `GET /api/users/:id`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id` (soft delete), `POST /api/users/:id/restore`.
- **`services/assessment-service` (Port `4003`, DB `assessment_db`):**
  - Tabel `assessment_cycles`, `daily_logs`, `assessments`.
  - Endpoint siklus & log harian: `GET /api/cycles`, `POST /api/cycles`, `GET /api/cycles/current`, `GET /api/cycles/daily-logs`, `POST /api/cycles/daily-logs`, `PUT /api/cycles/daily-logs/:id`, `DELETE /api/cycles/daily-logs/:id`.
  - Otomatis menghitung ulang `completion_rate`, `status` (`in_progress` / `completed` saat 14 hari / `expired` bila melewati `end_date`), dan `aggregated_features` (`faf_mean`, `tue_mean`, `fcvc_mode`, `favc_ratio`, `ch2o_mean`).
  - Endpoint asesmen: `GET /api/assessments`, `GET /api/assessments/:id`, `POST /api/assessments`.
- **Integrasi Frontend Web (`obsense_web`):**
  - Mengisi service layer: `userService.js`, `cycleService.js`, `assessmentService.js`, `dashboardService.js`.
  - Menghubungkan halaman: `Dashboard.js`, `UserList.js`, `UserDetailModal.js`, `UserEditModal.js`, `DataManagement.js`, dan `ReportsAnalytics.js` (serta memperbaiki progress bar & `DonutChart.js` saat data kosong).
- **Dokumentasi Tim Mobile:**
  - [PANDUAN_FASE_0_2_MOBILE.md](./PANDUAN_FASE_0_2_MOBILE.md)
  - [PANDUAN_FASE_3_MOBILE.md](./PANDUAN_FASE_3_MOBILE.md)

### Fase 4A (Issue #1) — `prediction-service` di `obsense_ml/` (Port `5001`, Python Flask) ✅
- **`obsense_ml/train.py` & `obsense_ml/requirements.txt`:**
  - Melatih dua pipeline Random Forest Tuned dari `ObesityDataSet_raw_and_data_sinthetic.csv` (`2111` → `2087` baris bersih setelah hapus `24` duplikat):
    - **Skenario A (Full Features – 16 fitur):** `models/pipeline_full.joblib` — **Test Accuracy `96.41%` | Weighted F1 `0.9641`**.
    - **Skenario B (Lifestyle-Only – 14 fitur, tanpa `Height` & `Weight`):** `models/pipeline_lifestyle.joblib` — **Test Accuracy `85.65%` | Weighted F1 `0.856`**.
  - Menghasilkan `obsense_ml/models/metadata.json` (6 eksperimen A/B testing, global *feature importance* Skenario A & B, dan matriks korelasi).
- **`obsense_ml/app.py` (Flask + CORS, Port `5001`, stateless/tanpa DB):**
  - Auto-training bila file `.joblib` belum tersedia di device baru.
  - `GET /health` — status service & model.
  - `GET /api/predict/metadata` — metrik eksperimen A/B, *feature importance*, dan korelasi.
  - `POST /api/predict` — otomatis normalisasi input (`height` cm → meter, `gender`, boolean/rasio → `'yes'`/`'no'`); mengembalikan `bmi`, `scenario_a_full` (bila `height` & `weight` tersedia), `scenario_b_lifestyle` (selalu aktif), `top_shap_factors` (5 faktor SHAP lokal dari Skenario B), dan `recommendations`.
- **Integrasi Gateway & Runner:**
  - Proxy `/api/predict` → `http://localhost:5001` aktif di `services/gateway/src/server.js` dan `services/gateway/.env.example`.
  - `prediction-service` sudah terdaftar di `scripts/start-all.ps1`.

### Fase 4B (Issue #2) — Sinkronisasi Fitur UCI & Trigger Prediksi Antar-Service ✅
- **`services/user-service` (`user_db`):**
  - Menambahkan kolom `smoke` (`BOOLEAN DEFAULT FALSE`) pada tabel `users` beserta migrasi otomatis saat startup, dan menyertakannya di `GET/PUT /api/users/me` serta `GET/POST/PUT /api/users`.
- **`services/assessment-service` (`assessment_db`):**
  - Menambahkan kolom `ncp` (`1–4`, default `3`) di `daily_logs`, serta `lifestyle_prediction` (JSON), `shap_factors` (JSON), dan `bmi` nullable di `assessments` (dengan migrasi otomatis pada tabel lama).
  - Memperbarui `refreshCycle()` agar `aggregated_features` merangkum lengkap 14 hari: `logged_days`, `faf_mean`, `tue_mean`, `fcvc_mode`, `ncp_mean`, `favc_ratio`, `ch2o_mean`, `caec_mode`, `scc_mode`, `calc_mode`, `mtrans_mode`.
  - Menambahkan endpoint **`POST /api/assessments/predict`** yang berkomunikasi antar-service (mengambil profil dari `user-service` + agregasi siklus dari `assessment_db`, memanggil `prediction-service :5001/api/predict`, lalu menyimpan hasil Skenario A, Skenario B, 5 faktor SHAP, dan rekomendasi ke `assessment_db.assessments`).

---

## 3. Fase yang Belum Dikerjakan (Sisa Fase 4C – Fase 8)

### Sisa Fase 4 — Integrasi ML ke Dashboard Web (Issue #3)
- **Issue #3 (`obsense_web` — Visualisasi A/B & SHAP):**
  - Buat `obsense_web/src/services/predictionService.js`.
  - Perbarui `ReportsAnalytics.js`, `FeatureBarChart.js`, dan `CorrelationHeatmap.js` agar memuat `GET /api/predict/metadata` + menambahkan **Toggle Skenario A vs Skenario B** dan tabel perbandingan A/B Testing (`96.41%` vs `85.65%`).
  - Tambahkan tombol **"Jalankan Prediksi ML"** dan tampilan dual-scenario (Skenario A + Skenario B + SHAP) di `UserDetailModal.js` & `DataManagement.js`.

### Fase 5 — `admin-service` (`:4005`, DB `admin_db`) & `audit-service` (`:4006`, DB `audit_db`)
> **Referensi kode lama:** Di GitHub pada commit `2a234e6` (branch `origin/mhilya`), sudah tersedia kode controller lama (`evaluationController.js`, `configController.js`, `auditController.js`) serta struktur tabel & seed konfigurasi WHO di `obsense_web/server/src/config/schema.sql` yang bisa langsung diadaptasi.

1. **`services/admin-service` (`:4005`, DB `admin_db`):**
   - Auto-init tabel `admin_evaluations` (tanpa FK ke database lain) dan `system_configurations` (beserta seed default `threshold_who_bmi`, `variable_mappings`, `ffq_window_settings`).
   - Endpoint:
     - `GET /api/evaluations?user_id=` & `POST /api/evaluations` (append-only evaluasi klinis dokter/admin).
     - `GET /api/configurations` & `PUT /api/configurations` (khusus `super_admin`).
2. **`services/audit-service` (`:4006`, DB `audit_db`):**
   - Auto-init tabel `audit_logs` (`id`, `admin_id`, `admin_name`, `admin_email`, `action`, `entity_type`, `entity_id`, `details` JSON, `ip_address`, `user_agent`, `created_at`).
   - Endpoint:
     - `GET /api/audit` (list & filter log aktivitas untuk admin web).
     - `POST /api/audit` (menerima pencatatan event aktivitas dari service lain secara *fire-and-forget*).
3. Tambahkan proxy `/api/evaluations`, `/api/configurations`, dan `/api/audit` di `services/gateway/src/server.js`, serta daftarkan kedua service ke `scripts/start-all.ps1`.

### Fase 6 — Penyelesaian Integrasi Web & Mobile + Pembersihan Monolith
1. **Sisa halaman web di `obsense_web` yang masih memakai `storageService.js`:**
   - `src/pages/evaluations/AdminEvaluations.js` → sambungkan `getEvaluations` & `addEvaluation` ke `/api/evaluations` (`admin-service`).
   - `src/pages/configurations/SystemConfig.js` → sambungkan `getConfigurations` & `updateConfigurations` ke `/api/configurations` (`admin-service`).
   - `src/pages/audit/AuditLogs.js` dan panel "Audit Aktivitas Terbaru" di `src/pages/Dashboard.js` → sambungkan ke `/api/audit` (`audit-service`).
   - *(Opsional pembersihan)* Pindahkan helper `exportToCSV` keluar dari `src/mock/storageService.js` ke utilitas tersendiri agar `storageService.js` bisa dihapus sepenuhnya.
2. **Grafik analitik web:**
   - `FeatureBarChart.js` dan `CorrelationHeatmap.js` → arahkan ke `GET /api/predict/metadata`.
   - `TrendLineChart.js` → bangun data tren mingguan/bulanan dari riwayat `/api/assessments`.
3. **Hapus monolith lama:**
   - Hapus folder `obsense_web/server/` setelah Fase 5 & integrasi web selesai.
4. **Integrasi `obsense_mobile`:**
   - Dikerjakan oleh tim mobile mengacu pada [PANDUAN_FASE_0_2_MOBILE.md](./PANDUAN_FASE_0_2_MOBILE.md) dan [PANDUAN_FASE_3_MOBILE.md](./PANDUAN_FASE_3_MOBILE.md).

### Fase 7 — Dokumentasi Akhir & Bahan Presentasi Dosen
- Lengkapi README utama proyek: diagram arsitektur microservices, penjelasan pemisahan *database-per-service*, daftar port, cara menjalankan, dan koleksi endpoint Postman/Thunder Client untuk demo.

### Fase 8 — Dockerisasi *(Opsional)*
- Tambahkan `Dockerfile` di masing-masing service dan `docker-compose.yml` di root jika ingin dijalankan sebagai container saat demo/deploy.

---

## 4. Checklist Setup Saat Pindah ke Device Baru

Karena file `.env` dan folder `node_modules/` tidak masuk ke Git (`.gitignore`), lakukan langkah ini di device baru:

1. **Pull branch terbaru:**
   ```powershell
   git fetch origin
   git switch feat/microservices
   git pull origin feat/microservices
   ```
2. **Pastikan prasyarat terpasang:**
   - Node.js (≥ 18 / 22), MySQL Server / XAMPP dalam kondisi menyala, dan Python 3 (instal dependency ML dengan `pip install -r obsense_ml/requirements.txt`).
3. **Buat & sesuaikan file `.env` tiap service** (salin dari `.env.example`):
   - `services/auth-service/.env` (`PORT=4001`, `DB_NAME=auth_db`, isi `DB_PASSWORD`, samakan `JWT_SECRET`)
   - `services/user-service/.env` (`PORT=4002`, `DB_NAME=user_db`, isi `DB_PASSWORD`, **samakan `JWT_SECRET`**)
   - `services/assessment-service/.env` (`PORT=4003`, `DB_NAME=assessment_db`, isi `DB_PASSWORD`, **samakan `JWT_SECRET`**, `USER_SERVICE_URL=http://localhost:4002`, `PREDICTION_SERVICE_URL=http://localhost:5001`)
   - `services/gateway/.env` (`PORT=4000`, `AUTH_SERVICE_URL`, `USER_SERVICE_URL`, `ASSESSMENT_SERVICE_URL`, `PREDICTION_SERVICE_URL`)
   *(Atau jalankan `.\scripts\start-all.ps1` sekali agar `.env` dibuat otomatis dari `.env.example`, lalu edit `DB_PASSWORD` dan `JWT_SECRET`, lalu restart service).*
4. **Jalankan semua service backend (4 Node.js + 1 Python ML):**
   ```powershell
   .\scripts\start-all.ps1
   ```
   Pastikan `http://localhost:4000/health` menampilkan `gateway` beserta route `/api/auth`, `/api/users`, `/api/cycles`, `/api/assessments`, `/api/predict`.
5. **Jalankan frontend web:**
   ```powershell
   cd obsense_web
   npm install
   npm start
   ```
   Login superadmin awal: `superadmin@obsense.com` / `admin123`.

---

## 5. Prompt Handover untuk Chat AI di Device Baru

Salin teks berikut ke chat AI baru setelah membuka proyek di device baru:

```text
Kita sedang mengerjakan migrasi proyek OBSENSE ke arsitektur Polyglot Microservices (Database-per-Service, Node.js + Python, tanpa Docker) di branch `feat/microservices`.
Baca dokumen `docs/ROADMAP_DAN_PROGRESS_MICROSERVICES.md` terlebih dahulu untuk konteks lengkap.

Ringkasan status saat ini (Fase 0 sampai Fase 4B / Issue #1 & #2 SUDAH SELESAI):
1. `services/gateway` (:4000) -> proxy ke auth, user, assessment, dan prediction service.
2. `services/auth-service` (:4001, DB `auth_db`: `users`, `admins`, `login_attempts`) -> `/api/auth/*`.
3. `services/user-service` (:4002, DB `user_db`: `users` termasuk kolom `smoke`) -> `/api/users/*`.
4. `services/assessment-service` (:4003, DB `assessment_db`: `assessment_cycles`, `daily_logs` termasuk `ncp`, `assessments` termasuk `lifestyle_prediction` & `shap_factors`) -> `/api/cycles/*`, `/api/assessments/*`, dan `POST /api/assessments/predict` (memanggil `user-service` + `prediction-service`).
5. `obsense_ml` (`prediction-service`, :5001, Python Flask + scikit-learn + SHAP) -> `/api/predict` & `/api/predict/metadata` dengan dua model Random Forest Tuned (Skenario A Full 96.41% & Skenario B Lifestyle-Only 85.65%).
6. `obsense_web` sudah terhubung ke `:4000/api` untuk Login, AdminManagement, Dashboard, UserList, UserDetailModal, UserEditModal, DataManagement, dan ReportsAnalytics (grafik Feature Importance & Correlation masih memakai konstanta mockData.js sampai Issue #3 dikerjakan).
7. Sebagai referensi kode lama, di commit `2a234e6` (`origin/mhilya`) terdapat `evaluationController.js`, `configController.js`, dan `auditController.js` di `obsense_web/server/src/controllers/`.

Fase yang BELUM dikerjakan:
- Issue #3 (Fase 4C): Integrasi metrik A/B testing, toggle SHAP Skenario A vs B, dan tombol trigger prediksi ML di `obsense_web`.
- Issue #4–#6 (Mobile): Integrasi auth, profil, log 14 hari, dan tampilan prediksi dual-scenario di `obsense_mobile`.
- Issue #7 (Fase 5 & 6): `services/admin-service` (:4005, DB `admin_db`), `services/audit-service` (:4006, DB `audit_db`), sambungkan 3 halaman web terakhir (`AdminEvaluations.js`, `SystemConfig.js`, `AuditLogs.js`), dan hapus `obsense_web/server/`.
- Fase 7: Dokumentasi akhir & Postman collection; Fase 8: Docker (opsional).

Tolong verifikasi kondisi repo saat ini, lalu tanyakan apakah saya ingin lanjut ke Issue #3 atau Issue #7.
```
