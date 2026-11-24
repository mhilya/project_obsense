# Panduan Fitur CRUD Profile & Ubah Password

## Overview
Fitur ini memungkinkan user untuk:
1. **Edit Nama dan Email** - Langsung di halaman profil dengan mode edit
2. **Ubah Password** - Melalui custom modal popup
3. **Semua perubahan tersimpan ke database** melalui API backend

## Perubahan Backend (Auth Service)

### Endpoints Baru

#### 1. Update Profile
```
PUT /auth/profile
Authorization: Bearer <token>

Request Body:
{
  "name": "Nama Lengkap",
  "email": "email@example.com"
}

Response 200:
{
  "message": "Profil berhasil diperbarui.",
  "user": {
    "id": 1,
    "name": "Nama Lengkap",
    "email": "email@example.com",
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}

Error 400:
{
  "message": "Email sudah digunakan oleh akun lain."
}
```

#### 2. Change Password
```
PUT /auth/change-password
Authorization: Bearer <token>

Request Body:
{
  "currentPassword": "password_lama",
  "newPassword": "password_baru"
}

Response 200:
{
  "message": "Password berhasil diubah."
}

Error 401:
{
  "message": "Password lama tidak sesuai."
}

Error 400:
{
  "message": "Password baru minimal 6 karakter."
}
```

### File Backend yang Diubah

1. **`services/auth-service/src/routes/authRoutes.js`**
   - Menambahkan route `PUT /profile`
   - Menambahkan route `PUT /change-password`

2. **`services/auth-service/src/controllers/authController.js`**
   - Menambahkan controller `updateProfile`
   - Menambahkan controller `changePassword`

## Perubahan Mobile App

### Komponen Baru

#### 1. ChangePasswordModal.tsx
Komponen modal popup untuk ubah password dengan fitur:
- Input password lama dengan toggle show/hide
- Input password baru dengan toggle show/hide
- Input konfirmasi password dengan toggle show/hide
- Validasi real-time (minimal 6 karakter, password cocok)
- Error handling
- Loading state

**Lokasi**: `obsense_mobile/src/components/ChangePasswordModal.tsx`

### File yang Diupdate

#### 1. authStorage.ts
Menambahkan fungsi baru:

```typescript
// Update profile (terhubung ke backend)
export async function updateUserProfile(
  updates: { name: string; email: string }
): Promise<{
  success: boolean;
  user?: UserProfile;
  error?: string;
}>

// Change password (terhubung ke backend)
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{
  success: boolean;
  error?: string;
}>
```

**Lokasi**: `obsense_mobile/src/utils/authStorage.ts`

#### 2. ProfileScreen.tsx
Perubahan fitur:
- **Mode Edit Nama & Email**: User bisa edit langsung di halaman profil
- **Modal Ubah Password**: Tombol "Ubah Password" membuka modal popup
- Validasi input (email format, nama tidak kosong)
- Integrasi dengan backend API
- Update cache lokal setelah sukses
- Alert feedback untuk user

**Lokasi**: `obsense_mobile/src/screens/ProfileScreen.tsx`

## Cara Testing

### 1. Jalankan Backend

```bash
# Terminal 1: Jalankan Auth Service
cd c:\project_obsense\services\auth-service
npm run dev
```

Auth service akan berjalan di `http://localhost:4001`

```bash
# Terminal 2: Jalankan Gateway
cd c:\project_obsense\services\gateway
npm start
```

Gateway akan berjalan di `http://localhost:4000`

### 2. Jalankan Mobile App

```bash
# Terminal 3: Jalankan Metro Bundler
cd c:\project_obsense\obsense_mobile
npm start

# Terminal 4: Jalankan di Android
npm run android
```

### 3. Test Flow

#### A. Test Update Profile
1. Login ke aplikasi mobile
2. Buka tab **Profil**
3. Tap tombol **Edit Profil**
4. Ubah nama dan/atau email
5. Tap tombol **Simpan**
6. Verifikasi:
   - Alert sukses muncul
   - Data profil terupdate di tampilan
   - Cek database: `SELECT * FROM users WHERE id = <user_id>;`

#### B. Test Change Password
1. Di halaman Profil, tap **Ubah Password**
2. Modal popup muncul
3. Isi form:
   - Password lama: password saat ini
   - Password baru: password baru (min 6 karakter)
   - Konfirmasi password: ulangi password baru
4. Tap **Ubah Password**
5. Verifikasi:
   - Alert sukses muncul
   - Modal tertutup
   - Logout dan login dengan password baru
   - Cek database: password ter-hash baru di tabel users

#### C. Test Validasi

**Update Profile:**
- [ ] Nama kosong → Error "Nama tidak boleh kosong"
- [ ] Email kosong → Error "Email tidak boleh kosong"
- [ ] Email invalid → Error "Format email tidak valid"
- [ ] Email sudah dipakai → Error "Email sudah digunakan oleh akun lain"

**Change Password:**
- [ ] Password lama kosong → Error "Password lama tidak boleh kosong"
- [ ] Password baru kosong → Error "Password baru tidak boleh kosong"
- [ ] Password < 6 karakter → Error "Password baru minimal 6 karakter"
- [ ] Password tidak cocok → Error "Konfirmasi password tidak cocok"
- [ ] Password lama salah → Error "Password lama tidak sesuai"
- [ ] Password baru = password lama → Error "Password baru harus berbeda"

## Database Schema

Tidak ada perubahan schema, menggunakan tabel existing:

```sql
-- Tabel users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Flow Diagram

```
Mobile App                  Gateway                  Auth Service              Database
    |                          |                          |                        |
    |-- PUT /auth/profile ---->|                          |                        |
    |   {name, email}          |-- PUT /auth/profile ---->|                        |
    |                          |   + Bearer token         |                        |
    |                          |                          |-- Verify token         |
    |                          |                          |-- Check email exists ->|
    |                          |                          |<- Result ---------------|
    |                          |                          |                        |
    |                          |                          |-- UPDATE users ------->|
    |                          |                          |<- Success --------------|
    |                          |                          |                        |
    |                          |<-- 200 OK ----------------|                        |
    |                          |   {message, user}        |                        |
    |<-- Success --------------|                          |                        |
    |   Update local cache     |                          |                        |
    |   Show alert             |                          |                        |
```

## Security Features

1. **Authentication Required**: Semua endpoint menggunakan JWT token
2. **Password Hashing**: Password di-hash dengan bcrypt (salt rounds: 10)
3. **Input Validation**: 
   - Email format validation
   - Password minimal 6 karakter
   - Nama tidak boleh kosong
4. **Email Uniqueness**: Cek email sudah dipakai atau belum
5. **Current Password Verification**: Harus input password lama untuk ubah password

## Error Handling

Semua error dari backend di-handle dengan baik di mobile:
- Network error → "Terjadi kesalahan. Silakan coba lagi."
- 400 Bad Request → Tampilkan pesan error dari server
- 401 Unauthorized → "Password lama tidak sesuai."
- 500 Server Error → "Terjadi kesalahan pada server."

## Troubleshooting

### 1. Backend tidak bisa connect
```bash
# Cek apakah auth-service berjalan
curl http://localhost:4001/auth/me -H "Authorization: Bearer <token>"

# Cek apakah gateway berjalan
curl http://localhost:4000/auth/me -H "Authorization: Bearer <token>"
```

### 2. Mobile tidak bisa hit API
- Pastikan `API_BASE_URL` di `obsense_mobile/src/utils/api.ts` benar
- Untuk Android emulator gunakan `http://10.0.2.2:4000`
- Untuk physical device gunakan IP komputer di network yang sama

### 3. Token expired
- Login ulang untuk mendapatkan token baru
- Token default expire dalam 7 hari (konfigurasi di `JWT_EXPIRES_IN`)

## Next Steps (Future Enhancement)

1. **Email Verification**: Kirim kode verifikasi saat ubah email
2. **Forgot Password**: Reset password via email
3. **Profile Picture**: Upload dan ubah foto profil
4. **Additional Fields**: Tambah field tanggal lahir, gender, alamat (Fase 3 - user-service)
5. **Password Strength Meter**: Indikator kekuatan password
6. **Activity Log**: Riwayat perubahan profil dan password

## File Structure Summary

```
project_obsense/
├── services/
│   └── auth-service/
│       └── src/
│           ├── routes/
│           │   └── authRoutes.js (UPDATED)
│           └── controllers/
│               └── authController.js (UPDATED)
│
└── obsense_mobile/
    └── src/
        ├── components/
        │   └── ChangePasswordModal.tsx (NEW)
        ├── screens/
        │   └── ProfileScreen.tsx (UPDATED)
        └── utils/
            └── authStorage.ts (UPDATED)
```

## Kesimpulan

Fitur CRUD profil dan ubah password sudah fully functional dengan:
✅ Update nama dan email tersimpan ke database
✅ Ubah password tersimpan ke database (ter-hash dengan bcrypt)
✅ Validasi input lengkap
✅ Error handling komprehensif
✅ UI/UX yang user-friendly dengan modal popup
✅ Security best practices (JWT, bcrypt, validation)

Semua perubahan terintegrasi dengan backend existing dan siap untuk production use!
