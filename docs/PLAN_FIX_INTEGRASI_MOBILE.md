# Rencana Perbaikan & Daftar Issue Integrasi `obsense_mobile`

Dokumen ini merangkum hasil audit kesesuaian kode **`obsense_mobile`** terhadap backend **Polyglot Microservices (API Gateway `:4000`)** serta status eksekusi seluruh issue integrasi mobile.

> **Status Terkini:** ✅ **Seluruh Issue (M-1 s.d. M-5, Cleanup TypeScript, dan Integrasi Evaluasi Klinis) 100% SELESAI** — terverifikasi `npx tsc --noEmit` (**0 error**).

---

## Ringkasan Status Eksekusi

| Issue | Komponen / Layar | Status | Ringkasan Perbaikan |
|---|---|---|---|
| **M-1** | `src/utils/api.ts` & `src/utils/authStorage.ts` | ✅ Selesai | `statusCode` dikembalikan di `apiRequest`/`authenticatedRequest`, parsing JSON diamankan, dan `GET/PUT /users/me` membaca `response.data?.data ?? response.data?.user`. |
| **M-2** | `src/screens/HealthCheckScreen.tsx` & `authStorage.ts` | ✅ Selesai | Pre-fill profil dari `GET /users/me`; alur submit 3 langkah: `PUT /users/me` → `GET /cycles/current` / `POST /cycles` → `POST /cycles/daily-logs` (lowercase + enum valid) → navigasi ke `AssessmentResult` (`triggerPrediction: true`). |
| **M-3** | `src/screens/AssessmentResultScreen.tsx` | ✅ Selesai | Unwrap envelope `result.data?.data`, normalisasi respons `POST /assessments/predict` & `GET /assessments/:id` (Skenario A/B, SHAP proporsional, mode Lifestyle-Only, format kelas obesitas). |
| **M-4** | `src/screens/HomeScreen.tsx` & `src/components/LineChart.tsx` | ✅ Selesai | Menghapus seluruh data mock; integrasi live via `useFocusEffect` + `RefreshControl` ke `GET /users/me`, `GET /cycles/current`, dan `GET /assessments`; perbaikan `LineChart` saat 1 titik data. |
| **M-5** | `ForgotPasswordScreen.tsx` & `auth-service` (`passwordResetController.js`) | ✅ Selesai | 3 endpoint OTP (`request-otp`, `verify-otp`, `reset-password`) & tabel `password_reset_otps` aktif penuh; `devOnly_otp` tampil di alert & console saat mode non-production. |
| **Cleanup** | `ForgotPasswordScreen.tsx` & `ChangePasswordModal.tsx` | ✅ Selesai | 4 error bawaan `Colors.backgroundLight` diperbaiki menjadi `Colors.background` → `npx tsc --noEmit` **0 error**. |
| **Bonus** | `AssessmentResultScreen.tsx` & `admin-service` (`evaluationController.js`) | ✅ Selesai | Kartu **Evaluasi Tenaga Kesehatan** di mobile terhubung ke `GET /api/evaluations` (menampilkan catatan klinis, rekomendasi klinis, & *adjusted risk level*), dengan filter otomatis `user_id = req.user.id` untuk akun mobile. |

---

## Issue M-1 — Perbaiki Wrapper `api.ts` & Kontrak `GET/PUT /users/me` di `authStorage.ts`

**Judul Issue:**
```text
fix(mobile-api): return statusCode in apiRequest and fix /users/me response parsing in authStorage
```
**Label:** `bug`, `mobile`, `priority-high`

### Deskripsi & Daftar Pekerjaan
1. **`obsense_mobile/src/utils/api.ts`:**
   - Tambahkan properti `statusCode?: number` pada tipe return `apiRequest` dan `authenticatedRequest`.
   - Sertakan `statusCode: response.status` pada return sukses maupun gagal agar penanganan error `401` (token kedaluwarsa), `404` (profil belum ada), dan `409` (siklus sudah berjalan) di layar lain berfungsi dengan benar.
2. **`obsense_mobile/src/utils/authStorage.ts`:**
   - Backend `user-service` (`GET /api/users/me` dan `PUT /api/users/me`) mengembalikan format:
     ```json
     { "success": true, "message": "...", "data": { "id": 1, "name": "...", "height": 172, "weight": 80, "bmi": 27.0, "smoke": false } }
     ```
   - Perbaiki `getUserProfile()` dan `updateCompleteUserProfile()` agar membaca **`response.data.data`** (bukan `response.data.user`).
   - Pastikan fungsi `registerUser` (atau `RegisterScreen`) setelah registrasi berhasil dapat meneruskan data `gender`, `birth_date`, `address` saat user login pertama kali / melengkapi profil.

### Acceptance Criteria
- `ProfileScreen` berhasil menampilkan tinggi badan, berat badan, BMI, dan status `smoke` yang tersimpan di `user_db.users`.
- Mengubah profil antropometri di `ProfileScreen` tersimpan ke `user_db` dan langsung terlihat di menu **Manajemen Data Pengguna** pada web admin.

---

## Issue M-2 — Perbaiki Alur `HealthCheckScreen` (`PUT /users/me` → Siklus 14 Hari → `POST /cycles/daily-logs`)

**Judul Issue:**
```text
fix(mobile-healthcheck): align 3-step HealthCheck flow with user-service and assessment-service daily logs
```
**Label:** `bug`, `mobile`, `priority-high`

### Deskripsi & Daftar Pekerjaan
Saat ini `obsense_mobile/src/screens/HealthCheckScreen.tsx` mengirim seluruh isi form 3 langkah ke `POST /cycles` dengan nama field huruf besar (`FCVC`, `CAEC` berupa angka `0–3`). Padahal kontrak backend memisahkan profil antropometri dan log harian:

- [x] **Langkah 1 — Simpan Profil Fisik ke `PUT /api/users/me`:**
  Kirim `{ name: nama, age: Number(usia), gender, height: Number(tinggiBadan), weight: Number(beratBadan), family_history_with_overweight: riwayatKeluarga === 'Ya', smoke: merokok === 'Ya' }`.
- [x] **Langkah 2 — Pastikan Siklus 14 Hari Aktif:**
  Panggil `GET /api/cycles/current`. Jika `data === null`, panggil `POST /api/cycles` (jika mengembalikan `409`, tetap lanjut karena siklus sudah aktif).
- [x] **Langkah 3 — Simpan Log Harian ke `POST /api/cycles/daily-logs`:**
  Konversi field kuesioner ke format lowercase & enum yang divalidasi `assessment-service`:
  - `fcvc`: integer `1–3` (`1` = Jarang, `2` = Kadang-kadang, `3` = Sering/Selalu) — *jangan kirim `0` karena validasi backend `1–3`!*
  - `caec`: string enum `'no' | 'Sometimes' | 'Frequently' | 'Always'` — *jangan kirim angka `0–3`!*
  - `faf`: integer `0–3`
  - `tue`: integer `0–2`
  - `ncp`: integer `1–4` (default `3`)
  - `favc`: boolean (`makananCepat === 'Sering' || makananCepat === 'Selalu'`)
  - `ch2o`: angka liter `0–9.9`
  - `scc`: boolean, `calc`: `'no' | 'Sometimes' | 'Frequently' | 'Always'`, `mtrans`: `'Public_Transportation' | 'Automobile' | 'Motorbike' | 'Bike' | 'Walking'`
- [x] Setelah `POST /cycles/daily-logs` sukses (`201`), arahkan ke `AssessmentResult` dengan `{ triggerPrediction: true, cycleId }`.

### Acceptance Criteria
- Submit Health Check dari mobile berhasil memperbarui profil di `user_db`, membuat/memperbarui siklus & log hari ini di `assessment_db`, dan tidak error `400` atau `409` meski di-submit lebih dari sekali pada hari yang sama.

---

## Issue M-3 — Perbaiki Parsing Dual-Scenario & SHAP di `AssessmentResultScreen`

**Judul Issue:**
```text
fix(mobile-prediction): unwrap assessment-service API envelope for dual-scenario results and SHAP factors
```
**Label:** `bug`, `mobile`, `machine-learning`, `priority-high`

### Deskripsi & Daftar Pekerjaan
Backend `assessment-service` mengembalikan format terbungkus (*envelope*):
- `GET /api/assessments` → `{ success: true, count: N, data: [ ... ] }`
- `GET /api/assessments/:id` → `{ success: true, data: { id, bmi, obesity_class, risk_level, probability_scores, recommendations, lifestyle_prediction, shap_factors, model_version, assessment_date } }`
- `POST /api/assessments/predict` → `{ success: true, message: "...", data: <record_assessment>, prediction: { bmi, scenario_a_full, scenario_b_lifestyle, top_shap_factors, recommendations } }`

Checklist perbaikan di **`obsense_mobile/src/screens/AssessmentResultScreen.tsx`**:
- [x] Perbaiki `fetchHistory()` dan `fetchAssessment()` agar membuka `result.data?.data` (bukan `result.data` langsung).
- [x] Buat fungsi normalisasi `normalizeAssessmentResponse(raw)` agar baik hasil dari `POST /assessments/predict` maupun `GET /assessments/:id` dipetakan ke satu struktur yang konsisten (`scenario_a_full`, `scenario_b_lifestyle`, `top_shap_factors`, `recommendations`, `bmi`).
- [x] Tangani mode *Lifestyle-Only* (`bmi === null` / `scenario_a_full.available === false`) dengan menampilkan banner informatif dan tetap merender hasil **Skenario B** + **5 faktor SHAP**.
- [x] Sambungkan kartu **Evaluasi Tenaga Kesehatan** ke `GET /api/evaluations` (`admin-service`) dengan filter otomatis milik user yang sedang login.

### Acceptance Criteria
- Menekan **"Analisis Risiko Obesitas Saya"** (atau datang dari `HealthCheckScreen`) langsung menampilkan kartu **Skenario A (Full)**, kartu **Skenario B (Lifestyle-Only)**, daftar **5 Faktor Pendorong SHAP**, **Rekomendasi**, dan daftar riwayat asesmen tanpa error.

---

## Issue M-4 — Ganti Data Mock di `HomeScreen` dengan Data Asli API

**Judul Issue:**
```text
feat(mobile-home): replace mock health data in HomeScreen with live user profile, 14-day cycle progress, and BMI trend
```
**Label:** `enhancement`, `mobile`, `priority-medium`

### Deskripsi & Daftar Pekerjaan
Di **`obsense_mobile/src/screens/HomeScreen.tsx`**, saat ini `healthData`, `dailyActivity`, `currentBMI = 27.6`, dan `targetProgress = 72` masih hardcoded.

- [x] Ambil data asli secara paralel saat layar difokuskan (`useFocusEffect` / `useEffect`):
  1. `getUserProfile()` (`GET /api/users/me`) → tampilkan `weight`, `height`, `bmi`, dan `obesity_class` asli (atau placeholder `"Belum diisi"` jika user baru).
  2. `GET /api/cycles/current` → tampilkan kartu **Progres Siklus 14 Hari** (`days_logged / 14`, persentase progres, ringkasan indikator gaya hidup, dan tombol cepat menuju `HealthCheck`).
  3. `GET /api/assessments` → bangun grafik tren BMI dari riwayat asesmen asli (tampilkan empty state rapi bila belum ada riwayat).
- [x] Hapus konstanta mock `healthData` dan `dailyActivity` di `HomeScreen.tsx`.

### Acceptance Criteria
- Tidak ada lagi angka dummy (`80.2 kg`, `BMI 27.6`, nama default `'Ilham'`) di `HomeScreen`; semua metrik mencerminkan data akun yang sedang login.

---

## Issue M-5 — Sinkronisasi Fitur Lupa Password OTP *(Opsional / Backend + Mobile)*

**Judul Issue:**
```text
feat(auth-otp): implement forgot-password OTP endpoints in auth-service or disable stub in mobile
```
**Label:** `enhancement`, `backend`, `mobile`, `priority-low`

### Deskripsi & Pilihan Keputusan
`obsense_mobile/src/screens/ForgotPasswordScreen.tsx` dan `authStorage.ts` memanggil 3 endpoint:
- `POST /api/auth/forgot-password/request-otp`
- `POST /api/auth/forgot-password/verify-otp`
- `POST /api/auth/forgot-password/reset-password`

Saat ini ketiga endpoint tersebut **belum ada** di `services/auth-service`. Pilih salah satu:
- **Opsi 1 (Implementasi penuh):** Tambahkan tabel `password_reset_otps` di `auth_db` dan 3 endpoint di `services/auth-service` (untuk demo lokal, kode OTP 6 digit bisa ditampilkan di log console `auth-service` atau dikirim via SMTP/Nodemailer).
- **Opsi 2 (Scope cepat untuk sidang):** Nonaktifkan sementara tautan *"Lupa Password"* di `LoginScreen.tsx` agar tidak menghasilkan error `404` saat demo ke dosen.

---

## Urutan Eksekusi yang Disarankan

```text
Issue M-1 (api.ts & authStorage.ts)
    │
    ▼
Issue M-2 (HealthCheckScreen -> /users/me + /cycles + /daily-logs)
    │
    ▼
Issue M-3 (AssessmentResultScreen -> dual-scenario + SHAP unwrap)
    │
    ▼
Issue M-4 (HomeScreen -> data real & progres siklus 14 hari)
    │
    ▼
Issue M-5 (Opsional: OTP Forgot Password di auth-service)
```
