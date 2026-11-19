# Fase 3 — user-service & assessment-service (Panduan Mobile + Web)

Melanjutkan [PANDUAN_FASE_0_2_MOBILE.md](./PANDUAN_FASE_0_2_MOBILE.md). Semua endpoint diakses lewat **API Gateway** (`:4000/api`) dengan header `Authorization: Bearer <token>` dari login.

## Service baru

| Service | Port | Database | Gateway prefix |
|---|---|---|---|
| user-service | 4002 | `user_db` (tabel `users`) | `/api/users` |
| assessment-service | 4003 | `assessment_db` (`assessment_cycles`, `daily_logs`, `assessments`) | `/api/cycles`, `/api/assessments` |

Menjalankan: `.\scripts\start-all.ps1` (sekarang menyalakan 4 service). File `.env` service baru berisi `DB_*` yang sama dengan auth-service, **`JWT_SECRET` wajib sama di semua service**.

## Konsep penting

- **`user_id` = `id` akun di auth-service.** Saat user mobile membuat profil lewat `PUT /api/users/me`, id profil otomatis sama dengan id akunnya. Pasien yang dibuat admin dari web memakai id ≥ 100000.
- **Tidak ada foreign key antar service.** `assessment_db` hanya menyimpan `user_id` tanpa FK ke `user_db`.
- **Akun mobile hanya bisa mengakses datanya sendiri.** Menyebut `user_id` orang lain → `403`. Admin (web) boleh menyebut `user_id` mana pun.
- Format respons sukses: `{ "success": true, "data": ..., "count": n? }`. Error: `{ "message": "..." }`.

## Endpoint untuk Mobile (akun user)

### Profil — user-service
| Method | Path | Keterangan |
|---|---|---|
| GET | `/users/me` | Profil sendiri. `404` bila belum dibuat. |
| PUT | `/users/me` | Buat/ubah profil (upsert, kirim field yang berubah saja). `201` saat dibuat, `200` saat diubah. |

Body `PUT /users/me` (semua opsional):
```json
{
  "name": "Dimas", "email": "dimas@email.com", "phone": "0812...",
  "gender": "Laki-laki",
  "birth_date": "2000-05-10",
  "height": 170, "weight": 80,
  "address": "Jl. ...",
  "family_history_with_overweight": true
}
```
- `gender` menerima `Male`/`Female` atau `Laki-laki`/`Perempuan`.
- `age` dihitung otomatis dari `birth_date` (atau kirim `age`).
- Respons berisi `bmi`, `obesity_class`, `risk_level` (aturan WHO dari BMI).
- Batas: tinggi 50–250 cm, berat 10–400 kg, usia 1–120.
- Field form `username` di RegisterScreen belum ada penyimpanannya (auth-service hanya `name/email/password`).

### Siklus 14 hari & log harian — assessment-service
| Method | Path | Keterangan |
|---|---|---|
| GET | `/cycles/current` | Siklus berjalan + daftar log (`data: null` bila belum ada). |
| POST | `/cycles` | Mulai siklus baru (14 hari dari hari ini). `409` bila masih ada siklus berjalan. |
| GET | `/cycles` | Riwayat siklus sendiri (`?status=completed`). |
| POST | `/cycles/daily-logs` | Simpan log harian. Kirim ulang di tanggal yang sama = update. |
| GET | `/cycles/daily-logs` | Riwayat log (`?cycle_id=`, `?start_date=&end_date=`). |

Body `POST /cycles/daily-logs` (semua opsional; default dalam kurung):
```json
{
  "log_date": "2026-11-19",
  "faf": 2, "tue": 1, "fcvc": 3, "favc": true, "ch2o": 2.0,
  "caec": "Sometimes", "scc": false, "calc": "no",
  "mtrans": "Walking", "notes": "..."
}
```
| Field | Nilai |
|---|---|
| `log_date` | `YYYY-MM-DD`, default hari ini, tidak boleh di masa depan, harus dalam rentang siklus |
| `faf` | 0–3 (default 0) |
| `tue` | 0–2 (default 0) |
| `fcvc` | 1–3 (default 1) |
| `favc`, `scc` | boolean |
| `ch2o` | liter, 0–9.9 (default 1.5) |
| `caec`, `calc` | `no` / `Sometimes` / `Frequently` / `Always` |
| `mtrans` | `Automobile` / `Motorbike` / `Bike` / `Public_Transportation` / `Walking` |

Respons berisi `log` (dengan `day_number` dihitung server) dan `cycle` (`status`, `completion_rate`, `aggregated_features`). Siklus menjadi `completed` saat 14 hari terisi, dan menjadi `expired` otomatis bila lewat `end_date`.

### Hasil asesmen
| Method | Path | Keterangan |
|---|---|---|
| GET | `/assessments` | Riwayat asesmen sendiri. |
| GET | `/assessments/:id` | Detail asesmen. |

> `POST /assessments` saat ini masih menerima hasil klasifikasi dari klien. Pada **Fase 4** hasilnya dibuat otomatis oleh prediction-service, dan endpoint ini akan dibatasi.

## Endpoint untuk Web (admin)

- `GET/POST /users`, `GET/PUT/DELETE /users/:id` (soft delete), `POST /users/:id/restore`. Filter list: `search`, `gender`, `status`, `includeDeleted`.
- `GET /cycles`, `GET /cycles/daily-logs`, `GET /assessments` — gunakan `?user_id=` untuk memfilter pasien.
- Respons list tidak lagi menyertakan `userName`/`userEmail` (itu data `user_db`, bukan `assessment_db`). Web mengambil nama dari `/users`.
- Detail pasien (`/users/:id`) tidak lagi menggabungkan siklus/asesmen. Web memanggil `/cycles?user_id=` dan `/assessments?user_id=` terpisah.

## Pengujian
Skrip uji end-to-end (32 skenario: auth, hak akses, validasi, siklus, log, asesmen) lulus semua lewat gateway.
