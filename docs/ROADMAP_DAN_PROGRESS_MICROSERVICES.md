# Roadmap & Progress Migrasi Microservices OBSENSE

Dokumen ini menjadi pegangan utama arsitektur, status seluruh fase pengerjaan, serta panduan setup bagi seluruh tim (`Backend`, `Web`, `Mobile`, dan `ML`).

---

## 1. Arsitektur Final (Polyglot Microservices — Tanpa Docker)

Semua aplikasi klien (`obsense_web` dan `obsense_mobile`) berkomunikasi melalui satu pintu masuk (**API Gateway** pada port `4000`). Satu server MySQL lokal menjalankan **5 database terpisah** (**Database-per-Service**, tanpa *foreign key* lintas database), ditambah 1 service Python ML (*stateless*, tanpa DB).

```text
obsense_web (React)  ─┐
                      ├──► API Gateway (:4000)
obsense_mobile (RN)  ─┘       │
                              ├──► /api/auth            ──► auth-service (:4001)       ──► [(auth_db)]
                              ├──► /api/users           ──► user-service (:4002)       ──► [(user_db)]
                              ├──► /api/cycles          ──► assessment-service (:4003) ──► [(assessment_db)]
                              ├──► /api/assessments     ──► assessment-service (:4003) ──► [(assessment_db)]
                              ├──► /api/evaluations     ──► admin-service (:4005)      ──► [(admin_db)]
                              ├──► /api/configurations  ──► admin-service (:4005)      ──► [(admin_db)]
                              ├──► /api/audit           ──► audit-service (:4006)      ──► [(audit_db)]
                              └──► /api/predict         ──► prediction-service (:5001) ──► (Python ML - Tanpa DB)
```

### Prinsip Arsitektur yang Diterapkan
1. **Database-per-Service:** Setiap service hanya mengakses database miliknya sendiri.
2. **Tanpa Foreign Key Lintas Database:** Referensi `user_id` dan `admin_id` disimpan sebagai referensi ID biasa tanpa constraint FK antar database.
3. **Sinkronisasi `user_id`:** Akun mobile memakai ID yang sama antara `auth_db.users` dan `user_db.users` (upsert `PUT /api/users/me`), sedangkan pasien yang dibuat admin memakai `AUTO_INCREMENT=100000`.
4. **JWT Secret Seragam:** Semua service Node.js memverifikasi Bearer JWT menggunakan `JWT_SECRET` yang sama.
5. **Komunikasi Antar-Service:**
   - `assessment-service` → `user-service` + `prediction-service` (saat `POST /api/assessments/predict`).
   - `admin-service` → `audit-service` (event *fire-and-forget* `EVALUATE` & `UPDATE_CONFIG`).

---

## 2. Status Keseluruhan Fase (Fase 0 – Fase 7 Selesai ✅)

| Fase | Cakupan | Status |
|---|---|---|
| **Fase 0** | `scripts/init-databases.sql`, `scripts/start-all.ps1`, `.gitignore`, pembersihan dummy `mockData.js` | ✅ Selesai |
| **Fase 1** | `services/auth-service` (`:4001`, `auth_db`: `users`, `admins`, `login_attempts` + CRUD admin + `profile`/`change-password`) | ✅ Selesai |
| **Fase 2** | `services/gateway` (`:4000`) + integrasi Login & Manajemen Admin web | ✅ Selesai |
| **Fase 3** | `services/user-service` (`:4002`, `user_db`) & `services/assessment-service` (`:4003`, `assessment_db`) + integrasi Dashboard, UserList, DataManagement, ReportsAnalytics | ✅ Selesai |
| **Fase 4** | **Issue #1–#3:** `obsense_ml` (`prediction-service` `:5001`, RF Tuned Skenario A `96.41%` & Skenario B `85.65%`, SHAP), kolom `smoke`/`ncp` + `POST /api/assessments/predict`, serta visualisasi A/B Testing & toggle SHAP di web | ✅ Selesai |
| **Fase 5** | **Issue #7 (Backend):** `services/admin-service` (`:4005`, `admin_db`: `admin_evaluations`, `system_configurations`) & `services/audit-service` (`:4006`, `audit_db`: `audit_logs`) | ✅ Selesai |
| **Fase 6** | **Issue #7 (Web) & Mobile (M-1 s.d. M-5):** 100% halaman web (`AdminEvaluations`, `SystemConfig`, `AuditLogs`, `Dashboard`, `AuthContext`) terhubung ke microservices, `exportCsv.js` dipisah, monolith lama `obsense_web/server/` dihapus; seluruh layar mobile (`HomeScreen`, `HealthCheckScreen`, `MonitoringScreen`, `AssessmentResultScreen` + Evaluasi Klinis dokter, `ProfileScreen`, `ForgotPasswordScreen` OTP) tersinkron ke API Gateway dengan `npx tsc --noEmit` **0 error** | ✅ Selesai |
| **Fase 7** | Dokumentasi akhir ([README.md](../README.md)), rencana & laporan fix mobile ([PLAN_FIX_INTEGRASI_MOBILE.md](./PLAN_FIX_INTEGRASI_MOBILE.md)), & koleksi Postman ([OBSENSE_Postman_Collection.json](./OBSENSE_Postman_Collection.json)) | ✅ Selesai |
| **Fase 8** | *(Opsional)* `Dockerfile` per service & `docker-compose.yml` | ⏳ Opsional |

---

## 3. Panduan Setup Lokal untuk Tim (Pull dari `feat/microservices`)

### A. Prasyarat
1. **Node.js** (≥ 18 / 22)
2. **MySQL Server / XAMPP / Laragon** dalam kondisi menyala (port `3306`)
3. **Python 3** + instal dependency ML sekali:
   ```powershell
   pip install -r obsense_ml/requirements.txt
   ```

### B. Konfigurasi File `.env`
Salin `.env.example` menjadi `.env` di tiap service (atau jalankan `.\scripts\start-all.ps1` sekali agar `.env` dibuat otomatis, lalu isi `DB_PASSWORD` dan samakan `JWT_SECRET` di semua service):
- `services/auth-service/.env` (`PORT=4001`, `DB_NAME=auth_db`)
- `services/user-service/.env` (`PORT=4002`, `DB_NAME=user_db`)
- `services/assessment-service/.env` (`PORT=4003`, `DB_NAME=assessment_db`, `USER_SERVICE_URL`, `PREDICTION_SERVICE_URL`)
- `services/admin-service/.env` (`PORT=4005`, `DB_NAME=admin_db`, `AUDIT_SERVICE_URL`)
- `services/audit-service/.env` (`PORT=4006`, `DB_NAME=audit_db`)
- `services/gateway/.env` (`PORT=4000`, seluruh `*_SERVICE_URL`)

### C. Menjalankan Semua Service (7 Service Sekaligus)
```powershell
.\scripts\start-all.ps1
```
Verifikasi: buka `http://localhost:4000/health` → harus muncul 8 prefix route (`/api/auth`, `/api/users`, `/api/cycles`, `/api/assessments`, `/api/evaluations`, `/api/configurations`, `/api/audit`, `/api/predict`).

### D. Menjalankan Web & Mobile
- **Web (`obsense_web`):** `cd obsense_web` → `npm install` → `npm start` (login superadmin awal: `superadmin@obsense.com` / `admin123`).
- **Mobile (`obsense_mobile`):** lihat [README.md](../README.md), [PLAN_FIX_INTEGRASI_MOBILE.md](./PLAN_FIX_INTEGRASI_MOBILE.md), dan [obsense_mobile/QUICK_START.md](../obsense_mobile/QUICK_START.md).
  - *Tips build Android di Windows (hindari error Ninja 260-char MAX_PATH):* buat junction di drive yang sama (`cmd /c mklink /J D:\m D:\msaif\Project\Laravel\project_obsense\obsense_mobile`), lalu jalankan `cd D:\m` → `npx react-native run-android --active-arch-only`.
