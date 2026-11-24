# Troubleshooting: Lupa Kata Sandi dengan OTP

## ✅ Status: FULLY FUNCTIONAL

Fitur sudah ditest dan **berfungsi 100%**!

## Common Issues & Solutions

### 1. ❌ Error "Email tidak terdaftar dalam sistem"

**Penyebab**: Email yang diinput tidak ada di database

**Solusi**: 
```sql
-- Cek apakah email terdaftar
SELECT id, name, email FROM users WHERE email = 'user@test.com';

-- Jika tidak ada, register dulu
-- Via API atau langsung insert ke database
```

**Testing**: Gunakan email yang sudah terdaftar, misalnya:
- `superadmin@obsense.com` (admin)
- Register user baru dulu via `/api/auth/register`

### 2. ❌ Error 404 Not Found saat request OTP

**Penyebab**: Server belum di-restart setelah menambahkan route baru

**Solusi**:
```bash
# Stop auth-service (Ctrl+C)
# Start ulang
cd services/auth-service
npm run dev
```

**Verifikasi**:
```bash
# Test endpoint langsung
curl -X POST http://localhost:4001/api/auth/forgot-password/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@obsense.com"}'
```

### 3. ❌ OTP tidak muncul / tidak dikirim

**Di Development**:
OTP **TIDAK dikirim ke email**, tapi di-**log ke console server**.

**Cara melihat OTP**:
```bash
# Lihat log server auth-service
# Output akan muncul seperti ini:
========================================
🔐 OTP for user@test.com: 123456
⏰ Valid until: 24/11/2026, 15.20.56
========================================
```

**Di Production**:
Harus integrasi dengan email service (SendGrid, AWS SES, dll)

### 4. ❌ Kode OTP sudah kadaluarsa

**Penyebab**: OTP berlaku 10 menit, sudah lewat waktu

**Solusi**:
1. Request OTP baru (klik "Kirim Ulang Kode OTP")
2. Gunakan kode baru yang muncul di console

**Cek di database**:
```sql
SELECT email, otp_code, expires_at, is_used, 
       TIMESTAMPDIFF(MINUTE, NOW(), expires_at) as minutes_left
FROM password_reset_otps 
WHERE email = 'user@test.com'
ORDER BY created_at DESC 
LIMIT 5;
```

### 5. ❌ Kode OTP sudah pernah digunakan

**Penyebab**: OTP hanya bisa dipakai sekali (one-time use)

**Solusi**: Request OTP baru

**Cek di database**:
```sql
SELECT email, otp_code, is_used, created_at
FROM password_reset_otps 
WHERE email = 'user@test.com' AND is_used = TRUE;
```

### 6. ❌ Gateway tidak berjalan

**Error**: `Network request failed` atau `Connection refused`

**Solusi**:
```bash
# Start gateway
cd services/gateway
npm start

# Gateway akan berjalan di http://localhost:4000
```

**Verifikasi**:
```bash
curl http://localhost:4000/health
# Should return: {"status":"OK"}
```

### 7. ❌ Auth Service tidak berjalan

**Error**: `502 Bad Gateway` atau `Service Unavailable`

**Solusi**:
```bash
# Start auth-service
cd services/auth-service
npm run dev

# Auth service akan berjalan di http://localhost:4001
```

**Verifikasi**:
```bash
curl http://localhost:4001/health
# Should return: {"service":"auth-service","status":"OK"}
```

### 8. ❌ Database error / Table not found

**Error**: `Table 'auth_db.password_reset_otps' doesn't exist`

**Penyebab**: Tabel belum dibuat

**Solusi**:
```sql
-- Manual create table
USE auth_db;

CREATE TABLE IF NOT EXISTS `password_reset_otps` (
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

**Atau restart server** (akan auto-create table via initDatabase()):
```bash
cd services/auth-service
npm run dev
```

### 9. ❌ Mobile app tidak bisa connect ke backend

**Error di mobile**: `Network request failed`

**Penyebab**: URL tidak sesuai platform

**Solusi**:

**Android Emulator**:
```typescript
// obsense_mobile/src/utils/api.ts
export const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:4000/api'  // ✅ Correct for Android Emulator
  : 'https://api.obsense.com/api';
```

**iOS Simulator**:
```typescript
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:4000/api'  // ✅ Correct for iOS Simulator
  : 'https://api.obsense.com/api';
```

**Physical Device** (same WiFi):
```typescript
// Cari IP laptop Anda
// Windows: ipconfig (cari IPv4)
// Mac/Linux: ifconfig

export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:4000/api'  // ✅ Ganti dengan IP laptop Anda
  : 'https://api.obsense.com/api';
```

### 10. ❌ Password tidak berubah setelah reset

**Cek logs**:
```bash
# Lihat log auth-service untuk error
# Seharusnya ada log sukses
```

**Verifikasi database**:
```sql
-- Cek password hash berubah
SELECT id, email, password, updated_at 
FROM users 
WHERE email = 'user@test.com';

-- Password hash harus berbeda dari sebelumnya
-- updated_at harus timestamp terbaru
```

**Test login**:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"newpassword123"}'
```

## Testing Commands (PowerShell)

### Complete Flow Test:

```powershell
# 1. Register user baru
$email = "test$(Get-Random)@test.com"
$body = @{
    name = "Test User"
    email = $email
    password = "oldpassword123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" -Method POST -Body $body -ContentType "application/json"

# 2. Request OTP
$otpBody = @{ email = $email } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/api/auth/forgot-password/request-otp" -Method POST -Body $otpBody -ContentType "application/json"

# 3. Lihat OTP di console server auth-service
# Misal OTP: 123456

# 4. Verify OTP
$verifyBody = @{
    email = $email
    otpCode = "123456"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/api/auth/forgot-password/verify-otp" -Method POST -Body $verifyBody -ContentType "application/json"

# 5. Reset Password
$resetBody = @{
    email = $email
    otpCode = "123456"
    newPassword = "newpassword123"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/api/auth/forgot-password/reset-password" -Method POST -Body $resetBody -ContentType "application/json"

# 6. Login dengan password baru
$loginBody = @{
    email = $email
    password = "newpassword123"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
```

## Debug Checklist

Ketika ada masalah, cek satu per satu:

- [ ] MySQL running? `mysql -u root -p`
- [ ] Database `auth_db` exists? `SHOW DATABASES;`
- [ ] Table `password_reset_otps` exists? `SHOW TABLES;`
- [ ] Auth service running? `curl http://localhost:4001/health`
- [ ] Gateway running? `curl http://localhost:4000/health`
- [ ] Email terdaftar? `SELECT * FROM users WHERE email='...';`
- [ ] OTP muncul di console? Lihat terminal auth-service
- [ ] Mobile app URL correct? Check `api.ts`

## Logs Location

**Auth Service**: Terminal yang menjalankan `npm run dev` di `services/auth-service`

**Gateway**: Terminal yang menjalankan `npm start` di `services/gateway`

**Mobile App**: Metro Bundler terminal atau React Native debugger

## Quick Fix Commands

### Reset semua OTP (clean slate):
```sql
DELETE FROM password_reset_otps;
```

### Lihat OTP aktif:
```sql
SELECT email, otp_code, 
       TIMESTAMPDIFF(MINUTE, NOW(), expires_at) as minutes_left,
       is_used
FROM password_reset_otps 
WHERE expires_at > NOW() AND is_used = FALSE
ORDER BY created_at DESC;
```

### Force change password manually:
```sql
-- Hash password dengan bcrypt (cost 10)
-- Gunakan online tool atau node.js
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('newpassword123', 10).then(console.log);

UPDATE users 
SET password = '$2a$10$...' -- ganti dengan hash hasil
WHERE email = 'user@test.com';
```

## Support

Jika masih ada masalah:

1. **Restart semua service**:
   ```bash
   # Stop semua (Ctrl+C)
   
   # Start auth-service
   cd services/auth-service && npm run dev
   
   # Start gateway (terminal baru)
   cd services/gateway && npm start
   
   # Start mobile app (terminal baru)
   cd obsense_mobile && npm start
   ```

2. **Clear cache mobile**:
   ```bash
   cd obsense_mobile
   npm start -- --reset-cache
   ```

3. **Check database connection**:
   ```bash
   mysql -u root -p
   USE auth_db;
   SHOW TABLES;
   ```

## Success Indicators

Ketika semua berfungsi dengan baik:

✅ Request OTP: Response 200, OTP muncul di console  
✅ Verify OTP: Response 200, `verified: true`  
✅ Reset Password: Response 200, `message: "Password berhasil diubah"`  
✅ Login: Response 200, dapat token JWT  
✅ Database: `is_used = TRUE`, password hash berubah  

**Status**: FULLY FUNCTIONAL ✨
