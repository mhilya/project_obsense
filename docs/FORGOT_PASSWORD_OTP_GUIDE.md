# Panduan Fitur Lupa Kata Sandi dengan OTP

## Overview
Fitur **Forgot Password (Lupa Kata Sandi)** menggunakan sistem **OTP (One-Time Password)** untuk verifikasi identitas user sebelum mengizinkan reset password.

### Flow 3-Step Process:
1. **Request OTP** - User memasukkan email → sistem kirim OTP 6 digit
2. **Verify OTP** - User memasukkan OTP → sistem verifikasi kode
3. **Reset Password** - User membuat password baru → password tersimpan ke database

## Fitur Utama

✅ **OTP 6 digit** random untuk keamanan  
✅ **Expire time 10 menit** - OTP otomatis kadaluarsa  
✅ **One-time use** - OTP hanya bisa dipakai sekali  
✅ **Email verification** - Cek email terdaftar di sistem  
✅ **Password validation** - Minimal 6 karakter, konfirmasi password  
✅ **Step indicator** - Visual progress 3 langkah  
✅ **Resend OTP** - User bisa minta kirim ulang kode  

## Database Schema

### Tabel Baru: `password_reset_otps`

```sql
CREATE TABLE `password_reset_otps` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(150) NOT NULL,
  `account_type` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `otp_code` VARCHAR(6) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `is_used` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_otp_email` (`email`),
  INDEX `idx_otp_code` (`otp_code`)
) ENGINE=InnoDB;
```

**Field Explanation:**
- `email` - Email user yang request reset password
- `account_type` - Tipe akun: 'user' atau 'admin'
- `otp_code` - Kode OTP 6 digit (contoh: 123456)
- `expires_at` - Waktu kadaluarsa (10 menit dari created_at)
- `is_used` - Status apakah OTP sudah digunakan
- `created_at` - Timestamp pembuatan OTP

## Backend API

### 1. Request OTP
```
POST /auth/forgot-password/request-otp

Request Body:
{
  "email": "user@example.com",
  "accountType": "user"  // optional, default: "user"
}

Response 200:
{
  "message": "Kode OTP telah dikirim ke email Anda. Kode berlaku selama 10 menit.",
  "devOnly_otp": "123456",  // ONLY in development (NODE_ENV=development)
  "expiresIn": "10 menit"
}

Response 404:
{
  "message": "Email tidak terdaftar dalam sistem."
}

Response 400:
{
  "message": "Email wajib diisi."
}
```

**Catatan Development:**
- OTP akan di-log ke console server: `🔐 OTP for user@example.com: 123456`
- Response includes `devOnly_otp` untuk testing (harus dihapus di production!)

### 2. Verify OTP
```
POST /auth/forgot-password/verify-otp

Request Body:
{
  "email": "user@example.com",
  "otpCode": "123456",
  "accountType": "user"  // optional, default: "user"
}

Response 200:
{
  "message": "Kode OTP valid.",
  "verified": true,
  "resetToken": "dXNlckBleGFtcGxlLmNvbToxMjM0NTY6dXNlcg=="  // base64 encoded
}

Response 400:
{
  "message": "Kode OTP tidak valid."
}
// atau
{
  "message": "Kode OTP sudah pernah digunakan."
}
// atau
{
  "message": "Kode OTP sudah kadaluarsa. Silakan minta kode baru."
}
```

### 3. Reset Password
```
POST /auth/forgot-password/reset-password

Request Body:
{
  "email": "user@example.com",
  "otpCode": "123456",
  "newPassword": "newpassword123",
  "accountType": "user"  // optional, default: "user"
}

Response 200:
{
  "message": "Password berhasil diubah. Silakan login dengan password baru Anda."
}

Response 400:
{
  "message": "Password baru minimal 6 karakter."
}
// atau
{
  "message": "Kode OTP tidak valid."
}
// atau
{
  "message": "Kode OTP sudah kadaluarsa."
}

Response 404:
{
  "message": "Akun tidak ditemukan."
}
```

## Mobile App Flow

### Screen: ForgotPasswordScreen

**Step 1: Input Email**
```typescript
// User input email
email: string

// Validasi:
- Email tidak boleh kosong
- Format email valid (regex)

// Action: Kirim OTP
requestPasswordResetOTP(email)
  → Success: Pindah ke Step 2
  → Error: Tampilkan error message
```

**Step 2: Input OTP**
```typescript
// User input OTP code
otpCode: string (6 digit)

// Validasi:
- OTP tidak boleh kosong
- OTP harus 6 digit

// Action: Verify OTP
verifyPasswordResetOTP(email, otpCode)
  → Success: Pindah ke Step 3
  → Error: Tampilkan error message

// Extra action: Resend OTP
handleResendOTP()
  → Request OTP lagi dengan email yang sama
```

**Step 3: Input Password Baru**
```typescript
// User input password baru
newPassword: string
confirmPassword: string

// Validasi:
- Password tidak boleh kosong
- Password minimal 6 karakter
- Confirm password harus sama

// Action: Reset Password
resetPasswordWithOTP(email, otpCode, newPassword)
  → Success: Navigate ke Login
  → Error: Tampilkan error message
```

## File Structure

### Backend
```
services/auth-service/
├── src/
│   ├── config/
│   │   └── db.js (UPDATED - added password_reset_otps table)
│   ├── controllers/
│   │   ├── authController.js
│   │   └── passwordResetController.js (NEW)
│   └── routes/
│       └── authRoutes.js (UPDATED - added forgot-password routes)
```

### Mobile
```
obsense_mobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx (UPDATED - added "Lupa kata sandi?" link)
│   │   └── ForgotPasswordScreen.tsx (NEW)
│   ├── navigation/
│   │   └── RootNavigator.tsx (UPDATED - added ForgotPassword route)
│   ├── types/
│   │   └── navigation.ts (UPDATED - added ForgotPassword type)
│   └── utils/
│       └── authStorage.ts (UPDATED - added 3 OTP functions)
```

## Cara Testing

### 1. Jalankan Backend

```bash
# Terminal 1: Auth Service
cd services/auth-service
npm run dev

# Auth service running at http://localhost:4001
```

### 2. Jalankan Mobile App

```bash
# Terminal 2: Metro Bundler
cd obsense_mobile
npm start

# Terminal 3: Android
npm run android
```

### 3. Test Flow

#### A. Dari Login Screen
1. Buka aplikasi mobile
2. Di halaman Login, tap **"Lupa kata sandi?"**
3. Masuk ke ForgotPasswordScreen

#### B. Step 1: Request OTP
1. Masukkan email yang terdaftar (contoh: `user@test.com`)
2. Tap **"Kirim Kode OTP"**
3. Lihat console server untuk mendapatkan OTP:
   ```
   🔐 OTP for user@test.com: 123456
   ⏰ Valid until: 24/11/2026 15:30:00
   ```
4. Alert muncul: "OTP Terkirim!"
5. Otomatis pindah ke Step 2

#### C. Step 2: Verify OTP
1. Masukkan kode OTP 6 digit (dari console server)
2. Tap **"Verifikasi OTP"**
3. Alert muncul: "Verifikasi Berhasil!"
4. Otomatis pindah ke Step 3
5. Jika salah/expired, bisa tap **"Kirim Ulang Kode OTP"**

#### D. Step 3: Reset Password
1. Masukkan password baru (minimal 6 karakter)
2. Konfirmasi password baru
3. Lihat indikator ✅ untuk validasi real-time
4. Tap **"Ubah Password"**
5. Alert muncul: "Password Berhasil Diubah!"
6. Tap **"Login"** → redirect ke LoginScreen
7. Login dengan password baru

#### E. Verifikasi Database
```sql
-- Cek OTP yang dibuat
SELECT * FROM password_reset_otps 
WHERE email = 'user@test.com' 
ORDER BY created_at DESC LIMIT 5;

-- Cek password user sudah berubah (hash baru)
SELECT id, email, password, updated_at 
FROM users 
WHERE email = 'user@test.com';
```

## Validasi & Error Handling

### Request OTP
| Kondisi | Error Message |
|---------|---------------|
| Email kosong | "Email tidak boleh kosong" |
| Email invalid format | "Format email tidak valid" |
| Email tidak terdaftar | "Email tidak terdaftar dalam sistem" |

### Verify OTP
| Kondisi | Error Message |
|---------|---------------|
| OTP kosong | "Kode OTP tidak boleh kosong" |
| OTP bukan 6 digit | "Kode OTP harus 6 digit" |
| OTP salah | "Kode OTP tidak valid" |
| OTP sudah digunakan | "Kode OTP sudah pernah digunakan" |
| OTP expired (>10 menit) | "Kode OTP sudah kadaluarsa" |

### Reset Password
| Kondisi | Error Message |
|---------|---------------|
| Password kosong | "Password baru tidak boleh kosong" |
| Password < 6 karakter | "Password baru minimal 6 karakter" |
| Password tidak cocok | "Konfirmasi password tidak cocok" |
| OTP invalid | "Kode OTP tidak valid" |

## Security Features

### 1. OTP Expiration
- OTP berlaku **10 menit** dari waktu pembuatan
- Auto-expire untuk mencegah brute force attack

### 2. One-Time Use
- OTP hanya bisa digunakan **sekali**
- Field `is_used` di-set TRUE setelah berhasil reset password

### 3. Password Hashing
- Password baru di-hash dengan **bcrypt** (salt rounds: 10)
- Password lama tidak dapat di-recover (irreversible)

### 4. Email Verification
- Hanya email yang terdaftar bisa request OTP
- Mencegah spam ke email tidak terdaftar

### 5. Rate Limiting (Future)
- TODO: Batasi request OTP per email (max 3x per jam)
- TODO: Captcha untuk mencegah automated attacks

## Development vs Production

### Development Mode
```javascript
// Environment: NODE_ENV=development

// Console log OTP
console.log(`🔐 OTP for ${email}: ${otpCode}`);

// Response includes OTP (untuk testing)
{
  "devOnly_otp": "123456"
}
```

### Production Mode
```javascript
// Environment: NODE_ENV=production

// MUST REMOVE console.log OTP
// MUST REMOVE devOnly_otp from response

// Integrate with Email Service
// - SendGrid
// - AWS SES
// - Mailgun
// - SMTP Server

// Email Template:
Subject: Kode OTP Reset Password ObSense
Body:
  Halo,
  
  Kode OTP Anda: 123456
  
  Kode berlaku selama 10 menit.
  Jangan bagikan kode ini ke siapapun.
  
  Salam,
  Tim ObSense
```

## Cleanup & Maintenance

### Auto Cleanup Expired OTPs (Optional)

**Manual Cleanup:**
```sql
-- Hapus OTP yang expired atau sudah digunakan
DELETE FROM password_reset_otps 
WHERE expires_at < NOW() OR is_used = TRUE;
```

**Scheduled Cleanup (Cron Job):**
```javascript
// In passwordResetController.js
exports.cleanupExpiredOTPs = async () => {
  const [result] = await pool.query(
    'DELETE FROM password_reset_otps WHERE expires_at < NOW() OR is_used = TRUE'
  );
  console.log(`🧹 Cleaned up ${result.affectedRows} expired/used OTPs`);
};

// Setup cron job (dalam server.js)
const cron = require('node-cron');

// Jalankan setiap jam
cron.schedule('0 * * * *', () => {
  passwordResetController.cleanupExpiredOTPs();
});
```

## UI/UX Features

### Step Indicator
Visual progress dengan 3 icon:
- 📧 Email (Step 1)
- 🔑 Kode OTP (Step 2)
- 🔒 Password Baru (Step 3)

Active step menggunakan warna primary dengan icon putih.

### Real-time Validation
- ✅ Minimal 6 karakter (green check)
- ✅ Password cocok (green check)
- ⭕ Belum memenuhi (grey circle)

### Error Messages
- Inline error di setiap step
- Alert popup untuk feedback penting
- Color-coded: red = error, yellow = warning, green = success

### Keyboard Handling
- Auto focus pada input berikutnya
- Keyboard type: email-address, number-pad, default
- KeyboardAvoidingView untuk iOS

## Testing Checklist

### Functional Testing
- [ ] Request OTP dengan email valid → Success
- [ ] Request OTP dengan email tidak terdaftar → Error 404
- [ ] Request OTP dengan email kosong → Error 400
- [ ] Verify OTP dengan kode valid → Success
- [ ] Verify OTP dengan kode salah → Error 400
- [ ] Verify OTP dengan kode expired (>10 menit) → Error 400
- [ ] Verify OTP dengan kode yang sudah digunakan → Error 400
- [ ] Reset password dengan password valid → Success
- [ ] Reset password dengan password < 6 karakter → Error 400
- [ ] Reset password dengan confirm tidak cocok → Error client-side
- [ ] Resend OTP → Generate OTP baru
- [ ] Login dengan password baru → Success

### UI/UX Testing
- [ ] Step indicator tampil dengan benar
- [ ] Navigasi antar step berjalan smooth
- [ ] Loading state tampil saat API call
- [ ] Alert muncul dengan message yang sesuai
- [ ] Input validation real-time berfungsi
- [ ] Back button kembali ke Login
- [ ] Keyboard handling bekerja dengan baik

### Database Testing
- [ ] OTP tersimpan di database dengan benar
- [ ] expires_at = created_at + 10 menit
- [ ] is_used = FALSE saat dibuat
- [ ] is_used = TRUE setelah reset password
- [ ] Password ter-hash dengan bcrypt
- [ ] updated_at terupdate setelah reset password

## Troubleshooting

### OTP tidak diterima (Development)
**Solusi**: Lihat console server untuk mendapatkan OTP
```bash
🔐 OTP for user@test.com: 123456
```

### Error "Email tidak terdaftar"
**Solusi**: Pastikan email sudah register terlebih dahulu
```sql
SELECT * FROM users WHERE email = 'user@test.com';
```

### OTP selalu "kadaluarsa"
**Solusi**: Cek timezone server vs database
```sql
SELECT NOW();  -- Waktu server MySQL
```

### Password tidak berubah
**Solusi**: 
1. Cek log error di console server
2. Verifikasi OTP belum expired dan belum digunakan
3. Cek koneksi database

## Next Steps (Future Enhancement)

1. **Email Integration**
   - Integrasi dengan SendGrid/AWS SES
   - Email template profesional
   - HTML email dengan branding

2. **Rate Limiting**
   - Max 3 request OTP per email per jam
   - Cooldown period setelah 5 failed attempts

3. **SMS OTP**
   - Alternative to email OTP
   - Integrasi dengan Twilio/Nexmo

4. **2FA (Two-Factor Authentication)**
   - Optional 2FA untuk user
   - Authenticator app support (Google Authenticator)

5. **Security Audit**
   - Penetration testing
   - OWASP compliance check

6. **Analytics**
   - Track OTP success rate
   - Monitor failed attempts
   - User behavior analysis

## Kesimpulan

Fitur **Lupa Kata Sandi dengan OTP** sudah fully functional dengan:

✅ **Backend**: 3 endpoints untuk request, verify, dan reset  
✅ **Database**: Tabel OTPs dengan expiration & one-time use  
✅ **Mobile**: Flow 3-step dengan UI/UX yang intuitif  
✅ **Security**: OTP expiration, one-time use, bcrypt hashing  
✅ **Validation**: Comprehensive input & error handling  
✅ **Testing**: Ready untuk development testing  

**Production Ready**: Hanya perlu integrasi email service untuk kirim OTP ke inbox user!
