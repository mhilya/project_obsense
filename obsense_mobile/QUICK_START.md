# 🚀 Quick Start - Integrasi Backend

## Setup Backend (5 menit)

### 1. Pastikan MySQL Running
- Buka XAMPP / MySQL Server
- Start MySQL service

### 2. Jalankan Backend Services
```powershell
cd project_obsense
.\scripts\start-all.ps1
```

### 3. Verifikasi Backend
Buka browser: `http://localhost:4000/health`

Harus tampil:
```json
{
  "service": "gateway",
  "status": "OK"
}
```

## Setup Mobile App (2 menit)

### 1. Konfigurasi API URL
Edit `src/utils/api.ts` baris 5-7:

**Untuk Android Emulator:**
```typescript
export const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:4000/api'  // ✅ Sudah benar
  : 'https://api.obsense.com/api';
```

**Untuk iOS Simulator:**
```typescript
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:4000/api'  // Ganti ini
  : 'https://api.obsense.com/api';
```

**Untuk Device Fisik (USB):**
```bash
# Jalankan command ini dulu:
adb reverse tcp:4000 tcp:4000

# Lalu pakai:
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:4000/api'
  : 'https://api.obsense.com/api';
```

**Untuk Device Fisik (WiFi):**
```bash
# 1. Cek IP laptop:
ipconfig  # Windows
ifconfig  # Mac/Linux

# 2. Pakai IP tersebut:
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.15:4000/api'  // Ganti dengan IP laptop
  : 'https://api.obsense.com/api';
```

### 2. Jalankan Mobile App
```bash
# Android
npm run android

# iOS
npm run ios
```

## Testing Flow

### 1. Register User Baru
```
Screen: Register
Input:
  - Nama: John Doe
  - Email: john@test.com
  - Password: password123
  - ✅ Setujui terms

Expected:
  ✅ Alert "Akun berhasil dibuat"
  ✅ Navigate ke Login screen
```

### 2. Login
```
Screen: Login
Input:
  - Email: john@test.com
  - Password: password123

Expected:
  ✅ Loading indicator muncul
  ✅ Navigate ke Home screen
  ✅ Nama "John Doe" tampil di greeting
```

### 3. View Profile
```
Screen: Profile (bottom tab)

Expected:
  ✅ Tampil nama: John Doe
  ✅ Tampil email: john@test.com
  ✅ Tampil role: user
  ✅ Tampil bergabung: [tanggal]
```

### 4. Logout
```
Screen: Profile → Tombol Logout

Expected:
  ✅ Alert konfirmasi "Yakin ingin keluar?"
  ✅ Pilih "Keluar"
  ✅ Navigate ke Login screen
```

### 5. Login Lagi (Test Token)
```
Screen: Login
Input:
  - Email: john@test.com
  - Password: password123

Expected:
  ✅ Login berhasil (token masih valid)
  ✅ Navigate ke Home dengan data user
```

## Troubleshooting Quick Fixes

### ❌ "Network request failed"
```bash
# Cek backend running:
curl http://localhost:4000/health

# Jika tidak running, start ulang:
cd project_obsense
.\scripts\start-all.ps1
```

### ❌ Backend running tapi app tidak connect
**Android Emulator:**
- Pastikan pakai `http://10.0.2.2:4000/api`
- JANGAN pakai `localhost`

**iOS Simulator:**
- Pakai `http://localhost:4000/api`
- Pastikan firewall tidak block port 4000

**Device Fisik:**
```bash
# Option 1: USB dengan adb reverse
adb reverse tcp:4000 tcp:4000

# Option 2: WiFi - cek IP laptop
ipconfig  # Gunakan IP WiFi adapter
```

### ❌ "Email sudah terdaftar"
- Gunakan email lain, atau
- Login dengan email yang sudah terdaftar

### ❌ "Email atau password salah"
- Cek typo di email/password
- Email harus yang sudah diregister
- Password case-sensitive

### ❌ App crash / blank screen
```bash
# Clear cache dan rebuild:
cd obsense_mobile

# Android:
cd android
./gradlew clean
cd ..
npm run android

# iOS:
cd ios
pod install
cd ..
npm run ios
```

## Debug Mode

### Enable Network Logs
Edit `src/utils/api.ts`, tambahkan di function `apiRequest`:

```typescript
export async function apiRequest<T>(...) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('→ API Request:', url);  // ADD THIS
  
  const response = await fetch(url, options);
  console.log('← API Response:', response.status);  // ADD THIS
  
  const data = await response.json();
  console.log('← API Data:', data);  // ADD THIS
  // ...
}
```

Lalu buka React Native Debugger untuk melihat logs.

## Need Help?

1. **Baca dokumentasi lengkap:** `CONFIG.md`
2. **Cek kontrak API:** `PANDUAN_FASE_0_2_MOBILE.md`
3. **Cek summary:** Artifact "Integrasi Backend - Complete Summary"

## Checklist Siap Testing

- [ ] MySQL service running
- [ ] Backend services running (`start-all.ps1`)
- [ ] Backend health check OK (`localhost:4000/health`)
- [ ] Mobile app API_BASE_URL sudah disesuaikan
- [ ] Mobile app bisa build dan run
- [ ] Register user baru berhasil
- [ ] Login berhasil dan dapat token
- [ ] Profile screen tampil data user
- [ ] Logout berhasil

Jika semua ✅, siap untuk development! 🎉
