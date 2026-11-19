# Panduan Migrasi Backend (Fase 0–2) & Integrasi untuk Tim Mobile

Dokumen ini merangkum perubahan arsitektur backend OBSENSE yang sudah dikerjakan pada **Fase 0 sampai Fase 2** (tanpa Docker), daftar file yang ditambahkan/diubah, cara menjalankan server backend secara lokal, serta panduan integrasi untuk tim **`obsense_mobile`**.

---

## 1. Ringkasan Perubahan Arsitektur (Fase 0 – Fase 2)

Sebelumnya, backend hanya berupa satu server monolitik di `obsense_web/server/` (port `5000`) dengan satu database `obsense_db`, sementara frontend web dan aplikasi mobile sebagian besar masih memakai data dummy / penyimpanan lokal.

Sekarang backend mulai dipecah menjadi **microservices** dengan **database per service**:

```text
+--------------------+         +----------------------+         +-----------------------+
|   obsense_web      | ------> |                      |         |     auth-service      |
|   (React Admin)    |         |     API Gateway      | ------> |    localhost:4001     |
+--------------------+   REST  |    localhost:4000    |  proxy  +-----------------------+
                               |                      |                     |
+--------------------+         |  Prefix: /api/auth   |                     v
|   obsense_mobile   | ------> |                      |             [( auth_db )]
|   (React Native)   |         +----------------------+       users, admins, login_attempts
+--------------------+
```

### Poin penting untuk tim Mobile
1. **Satu pintu masuk (API Gateway) di port `4000`:** Aplikasi mobile cukup menembak **API Gateway (`:4000`)**, **bukan** menembak langsung port masing-masing service (`:4001`, dst.).
2. **Service pertama yang aktif adalah `auth-service` (`:4001`):** Mengelola registrasi user, login user, login admin (khusus web), validasi token JWT (`/api/auth/me`), serta pencatatan riwayat percobaan login (`login_attempts`) di database khusus **`auth_db`**.
3. **Database terpisah disiapkan untuk fase berikutnya:** Skrip inisialisasi menyiapkan 5 database MySQL (`auth_db`, `user_db`, `assessment_db`, `admin_db`, `audit_db`). Saat ini baru `auth_db` yang aktif dipakai.
4. **Tanpa Docker (untuk tahap development sekarang):** Semua service dijalankan lokal dengan Node.js + MySQL lokal melalui skrip PowerShell `scripts/start-all.ps1`.

---

## 2. Daftar Perubahan & File Baru

### A. Root & Skrip Inisialisasi (Fase 0)
| File | Status | Keterangan |
|---|---|---|
| `.gitignore` | Baru | Mengabaikan `node_modules/`, `.env` (kecuali `.env.example`), log, output build, serta cache/venv Python untuk service ML nanti. |
| `scripts/init-databases.sql` | Baru | DDL untuk membuat 5 database terpisah: `auth_db`, `user_db`, `assessment_db`, `admin_db`, `audit_db`. |
| `scripts/start-all.ps1` | Baru | Runner PowerShell untuk menjalankan `auth-service` dan `gateway` di jendela terpisah (otomatis `npm install` dan membuat `.env` dari `.env.example` jika belum ada). |

### B. `services/auth-service` — Port `4001` (Fase 1)
| File | Keterangan |
|---|---|
| `services/auth-service/package.json` | Dependency: `express`, `mysql2`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`. |
| `services/auth-service/.env.example` | Template konfigurasi `PORT=4001`, koneksi MySQL `auth_db`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `SEED_ADMIN_PASSWORD`. |
| `services/auth-service/src/server.js` | Entry point server (`:4001`), inisialisasi database, mount `/api/auth`, dan `GET /health`. |
| `services/auth-service/src/config/db.js` | Otomatis membuat database `auth_db` beserta tabel `users`, `admins`, `login_attempts` saat startup, dan membuat akun seed `superadmin@obsense.com` jika tabel `admins` kosong. |
| `services/auth-service/src/controllers/authController.js` | Handler `register`, `login`, `adminLogin`, `getMe`, serta pencatatan setiap attempt ke `login_attempts`. |
| `services/auth-service/src/controllers/adminController.js` | Handler CRUD & reset password admin (khusus web `super_admin`). |
| `services/auth-service/src/middleware/authMiddleware.js` | Verifikasi header `Authorization: Bearer <token>` JWT. |
| `services/auth-service/src/middleware/roleMiddleware.js` | Middleware `requireSuperAdmin` untuk membatasi endpoint admin web. |
| `services/auth-service/src/routes/authRoutes.js` | Registrasi semua route `/api/auth/*`. |

### C. `services/gateway` — Port `4000` (Fase 2)
| File | Keterangan |
|---|---|
| `services/gateway/package.json` | Dependency: `express`, `cors`, `dotenv`, `http-proxy-middleware`. |
| `services/gateway/.env.example` | Template konfigurasi `PORT=4000` dan `AUTH_SERVICE_URL=http://localhost:4001` (plus placeholder URL untuk service fase 3–5). |
| `services/gateway/src/server.js` | Proxy seluruh request `/api/auth/*` ke `auth-service` dan menyediakan `GET /health`. |

### D. Penyesuaian di `obsense_web` (Pembersihan Dummy & Integrasi Auth Web)
| File | Keterangan |
|---|---|
| `obsense_web/src/mock/mockData.js` | Data dummy transaksional dikosongkan (`[]`): `INITIAL_USERS`, `INITIAL_ASSESSMENT_CYCLES`, `INITIAL_DAILY_LOGS`, `INITIAL_ASSESSMENTS`, `INITIAL_ADMIN_EVALUATIONS`, `INITIAL_AUDIT_LOGS`, `INITIAL_LOGIN_ATTEMPTS`, dan `RISK_TREND_DATA`. |
| `obsense_web/src/components/charts/TrendLineChart.js` | Menambahkan fallback teks `"Belum ada data tren risiko."` saat data kosong (`data.length < 2`). |
| `obsense_web/src/utils/constants.js` | Mengarahkan `API_BASE_URL` dari `http://localhost:5000/api` menjadi `http://localhost:4000/api` (API Gateway). |
| `obsense_web/src/context/AuthContext.js` | Login admin web memanggil `POST /api/auth/admin/login`, mengecek sesi saat load lewat `GET /api/auth/me`, dan menghapus auto-login demo. |
| `obsense_web/src/pages/admins/AdminManagement.js` | Manajemen admin (list, tambah, edit, aktif/nonaktif, reset password) beralih ke endpoint `/api/auth/admins*` menggantikan `storageService`. |

> **Catatan:** Folder lama `obsense_web/server/` masih dibiarkan sementara sampai seluruh service fase berikutnya selesai. Jangan menjalankan server lama tersebut untuk menghindari bentrok dengan arsitektur baru.

---

## 3. Cara Menjalankan Backend di Laptop/PC (Untuk Testing Mobile)

Prasyarat: **Node.js** dan **MySQL** lokal (XAMPP / MySQL Server) sudah terpasang dan berjalan.

1. **Siapkan `.env` untuk `auth-service`:**
   Salin `services/auth-service/.env.example` menjadi `services/auth-service/.env` (atau biarkan `start-all.ps1` menyalinnya otomatis saat pertama kali dijalankan), lalu isi `DB_PASSWORD` sesuai password MySQL lokal Anda:
   ```env
   PORT=4001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password_mysql_anda
   DB_NAME=auth_db
   DB_PORT=3306
   JWT_SECRET=samakan_secret_ini_di_semua_service
   JWT_EXPIRES_IN=7d
   SEED_ADMIN_PASSWORD=admin123
   ```
   *(Jika MySQL Anda tanpa password, biarkan `DB_PASSWORD=` kosong).*

2. **Siapkan `.env` untuk `gateway`:**
   Salin `services/gateway/.env.example` menjadi `services/gateway/.env` (default `PORT=4000` dan `AUTH_SERVICE_URL=http://localhost:4001`).

3. **Jalankan semua service dengan satu perintah PowerShell dari root proyek:**
   ```powershell
   cd path\ke\project_obsense
   .\scripts\start-all.ps1
   ```
   Jika muncul error *execution policy*, jalankan:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\start-all.ps1
   ```
   Skrip ini akan membuka 2 jendela PowerShell (`auth-service` dan `gateway`). **Biarkan kedua jendela tetap terbuka.**

4. **Verifikasi service berjalan:**
   - Di jendela `auth-service` muncul: `auth-service: database "auth_db" siap.`
   - Buka browser / Postman ke `http://localhost:4000/health`, pastikan muncul:
     ```json
     {
       "service": "gateway",
       "status": "OK",
       "routes": ["/api/auth"]
     }
     ```
   - *(Opsional)* Untuk membuat seluruh 5 database sekaligus sejak awal, jalankan isi file `scripts/init-databases.sql` di MySQL/phpMyAdmin. Khusus `auth_db`, sudah dibuat otomatis saat `auth-service` menyala.

---

## 4. Panduan Integrasi untuk Tim `obsense_mobile`

### A. Base URL API Gateway per Environment
Di React Native, `localhost` di dalam emulator mengacu ke perangkat emulator itu sendiri, bukan ke laptop/PC host. Gunakan Base URL berikut:

| Skenario Testing | Base URL |
|---|---|
| **Android Emulator** | `http://10.0.2.2:4000/api` |
| **Android HP Fisik via USB (`adb reverse`)** | `http://localhost:4000/api` *(jalankan `adb reverse tcp:4000 tcp:4000` di terminal)* |
| **Android/iOS HP Fisik via Wi-Fi yang sama** | `http://<IP_LAN_LAPTOP>:4000/api` *(misal `http://192.168.1.15:4000/api`)* |
| **iOS Simulator (macOS)** | `http://localhost:4000/api` |

> **Tips koneksi HP Fisik:** Gunakan `adb reverse tcp:4000 tcp:4000` saat debugging via kabel USB agar tetap bisa memakai `http://localhost:4000/api` tanpa terhalang Windows Firewall atau ganti-ganti IP Wi-Fi.

---

### B. Kontrak Endpoint untuk User Mobile

Endpoint yang dipakai oleh **aplikasi mobile** (user/pasien) adalah:

> **Jangan gunakan** endpoint `/api/auth/admin/login` atau `/api/auth/admins/*` di mobile—endpoint tersebut khusus dashboard admin web (`admins` table & role `super_admin`).

#### 1. Register User Baru
- **Method & URL:** `POST /api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "Dimas Prasetyo",
    "email": "dimas@email.com",
    "password": "password123"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "message": "Registrasi berhasil! Silakan masuk.",
    "user": {
      "id": 1,
      "name": "Dimas Prasetyo",
      "email": "dimas@email.com",
      "role": "user"
    }
  }
  ```
- **Response `400 Bad Request`:**
  - Field kosong: `{ "message": "Nama, email, dan password wajib diisi." }`
  - Email sudah ada: `{ "message": "Email sudah terdaftar. Silakan gunakan email lain atau login." }`
- **Response `500`:** `{ "message": "Terjadi kesalahan pada server saat registrasi." }`

#### 2. Login User
- **Method & URL:** `POST /api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "dimas@email.com",
    "password": "password123"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "message": "Login berhasil!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Dimas Prasetyo",
      "email": "dimas@email.com",
      "role": "user"
    }
  }
  ```
  - **Simpan `token`** (dan data `user` jika perlu) ke `@react-native-async-storage/async-storage`.
  - Token berlaku selama `7d` (sesuai `JWT_EXPIRES_IN`).
- **Response `400 Bad Request`:** `{ "message": "Email dan password wajib diisi." }`
- **Response `401 Unauthorized`:** `{ "message": "Email atau password salah." }` *(percobaan gagal otomatis dicatat di tabel `login_attempts`)*.

#### 3. Cek Sesi & Ambil Profil User yang Sedang Login
- **Method & URL:** `GET /api/auth/me`
- **Headers:**
  ```http
  Authorization: Bearer <token_jwt>
  ```
- **Response `200 OK`:**
  ```json
  {
    "user": {
      "id": 1,
      "name": "Dimas Prasetyo",
      "email": "dimas@email.com",
      "role": "user",
      "created_at": "2026-11-17T07:12:21.000Z"
    }
  }
  ```
- **Response `401 Unauthorized`:**
  - Header tidak ada / format salah: `{ "message": "Akses ditolak: Token autentikasi tidak ditemukan." }`
  - Token invalid / expired: `{ "message": "Token tidak valid atau telah kedaluwarsa." }`
- **Response `404 Not Found`:** `{ "message": "Akun tidak ditemukan." }`

#### Error dari Gateway (jika `auth-service` mati)
- **Status `502 Bad Gateway`:**
  ```json
  {
    "message": "Service tidak tersedia (/api/auth).",
    "detail": "..."
  }
  ```

---

### C. Titik Kode di `obsense_mobile` yang Perlu Disesuaikan

Dari hasil pengecekan codebase `obsense_mobile`, paket `@react-native-async-storage/async-storage` **sudah terpasang** di `obsense_mobile/package.json` (dan tidak memakai `axios`, jadi bisa langsung menggunakan `fetch` bawaan React Native).

Berikut bagian yang saat ini masih mock/lokal dan perlu diarahkan ke API Gateway:

1. **Buat helper API / perbarui `obsense_mobile/src/utils/authStorage.ts`:**
   - Saat ini `authStorage.ts` masih menyimpan user di array in-memory (`const users: RegisteredUser[] = []`).
   - Ganti menjadi pemanggilan `fetch` ke `${API_BASE_URL}/auth/register`, `${API_BASE_URL}/auth/login`, dan `${API_BASE_URL}/auth/me`, serta fungsi simpan/ambil/hapus token menggunakan `AsyncStorage`.

2. **`obsense_mobile/src/screens/LoginScreen.tsx`:**
   - Saat ini `handleLogin` masih mengomentari validasi dan langsung `navigation.replace('Home')`.
   - Aktifkan validasi input, panggil `POST /api/auth/login` (dengan loading state), simpan `token` & `user` ke `AsyncStorage`, baru navigasi ke `'Home'`. Jika `401` atau gagal koneksi, tampilkan `CustomAlert`.

3. **`obsense_mobile/src/screens/RegisterScreen.tsx`:**
   - **Perhatian perbedaan field form:** Form di `RegisterScreen.tsx` saat ini memiliki field `username`, `nama`, `email`, `tanggalLahir`, `gender`, `alamat`, dan `password`.
   - Pada tahap **Fase 0–2**, `POST /api/auth/register` di `auth-service` **hanya menerima** `{ name, email, password }` (karena `auth_db.users` khusus menyimpan kredensial autentikasi).
   - Untuk integrasi saat ini, kirim `{ name: nama.trim(), email: email.trim(), password }` ke `/api/auth/register`.
   - Data profil lengkap dan antropometri (`gender`, `age`, `height`, `weight`, `phone`, `family_history_with_overweight`, dll.) akan dikelola oleh **`user-service` (`user_db`)** pada **Fase 3**.

4. **`obsense_mobile/src/screens/ProfileScreen.tsx` & `RootNavigator.tsx`:**
   - `ProfileScreen.tsx` saat ini masih menampilkan `MOCK_USER` dan `handleLogout` memakai `setTimeout`. Ubah agar mengambil data dari `GET /api/auth/me` (atau state user tersimpan) dan `handleLogout` menghapus token dari `AsyncStorage` sebelum kembali ke `'Login'`.
   - Di `RootNavigator.tsx` / splash check awal, bisa cek token tersimpan di `AsyncStorage` lalu validasi via `GET /api/auth/me` untuk auto-login jika token masih valid.

---

## 5. Status Roadmap & Yang Menyusul untuk Mobile

| Fase | Layanan & Cakupan | Status | Dampak ke Tim Mobile |
|---|---|---|---|
| **Fase 0** | Script database & runner lokal | ✅ Selesai | Menjalankan backend cukup 1 perintah (`start-all.ps1`). |
| **Fase 1** | `auth-service` (`auth_db`) | ✅ Selesai | Bisa langsung integrasi Register, Login, dan Cek Profil `/auth/me`. |
| **Fase 2** | `gateway` (`:4000`) + Auth Web | ✅ Selesai | Semua endpoint diakses lewat satu base URL `:4000/api`. |
| **Fase 3** | `user-service` (`user_db`) & `assessment-service` (`assessment_db`) | ⏳ Berikutnya | Menyediakan endpoint profil antropometri pasien, siklus 14 hari, dan input daily log dari mobile. |
| **Fase 4** | `prediction-service` (`obsense_ml`) | ⏳ Belum | Prediksi 7 kelas obesitas dari data 14 hari. |
| **Fase 5** | `admin-service` & `audit-service` | ⏳ Belum | Khusus evaluasi klinis admin, konfigurasi WHO, dan audit log (web). |
| **Fase 6** | Migrasi penuh Web & Mobile ke API | ⏳ Sebagian | Mobile mengganti semua mock storage ke endpoint Fase 1–4. |
