# Konfigurasi API Backend - ObsenseMobile

## 🌐 Environment Setup

Aplikasi mobile perlu dikonfigurasi untuk terhubung ke backend API Gateway sesuai dengan environment testing Anda.

### Base URL Configuration

Edit file `src/utils/api.ts` dan sesuaikan `API_BASE_URL` dengan environment Anda:

```typescript
export const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:4000/api'  // <- GANTI SESUAI ENVIRONMENT
  : 'https://api.obsense.com/api';
```

### Environment Options

| Environment | Base URL | Catatan |
|------------|----------|---------|
| **Android Emulator** | `http://10.0.2.2:4000/api` | `10.0.2.2` adalah alias untuk `localhost` host machine |
| **iOS Simulator** | `http://localhost:4000/api` | iOS simulator bisa akses `localhost` langsung |
| **Device via USB + adb reverse** | `http://localhost:4000/api` | Jalankan: `adb reverse tcp:4000 tcp:4000` |
| **Device via WiFi (same network)** | `http://192.168.1.x:4000/api` | Ganti `192.168.1.x` dengan IP laptop/PC Anda |

## 🚀 Cara Menjalankan Backend

### Prasyarat
- Node.js installed
- MySQL server running (XAMPP / MySQL Server)
- Backend repository sudah di-clone

### Langkah-langkah

1. **Pastikan MySQL sudah running**
   - Buka XAMPP / MySQL Server
   - Pastikan port 3306 aktif

2. **Konfigurasi backend** (hanya sekali)
   ```powershell
   cd path\ke\project_obsense
   
   # Copy .env.example menjadi .env di auth-service
   copy services\auth-service\.env.example services\auth-service\.env
   
   # Copy .env.example menjadi .env di gateway
   copy services\gateway\.env.example services\gateway\.env
   ```

3. **Edit `services/auth-service/.env`**
   ```env
   PORT=4001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password  # <- GANTI SESUAI MYSQL ANDA
   DB_NAME=auth_db
   DB_PORT=3306
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRES_IN=7d
   SEED_ADMIN_PASSWORD=admin123
   ```

4. **Jalankan semua services**
   ```powershell
   cd path\ke\project_obsense
   .\scripts\start-all.ps1
   ```
   
   Atau jika ada error execution policy:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\start-all.ps1
   ```

5. **Verifikasi backend berjalan**
   - Buka browser ke `http://localhost:4000/health`
   - Harus tampil:
     ```json
     {
       "service": "gateway",
       "status": "OK",
       "routes": ["/api/auth"]
     }
     ```

## 📱 Testing dari Device Fisik

### Option 1: USB dengan adb reverse (Recommended untuk Android)

```bash
# 1. Sambungkan device via USB dengan USB debugging enabled
# 2. Jalankan di terminal:
adb reverse tcp:4000 tcp:4000

# 3. Set API_BASE_URL ke:
http://localhost:4000/api
```

**Kelebihan:** Tidak perlu ganti IP, tidak terpengaruh firewall

### Option 2: WiFi (same network)

```bash
# 1. Pastikan laptop dan device di WiFi yang sama
# 2. Cek IP laptop:

# Windows:
ipconfig
# Cari "IPv4 Address" di adapter WiFi (contoh: 192.168.1.15)

# Mac/Linux:
ifconfig
# Cari "inet" di adapter WiFi

# 3. Set API_BASE_URL ke:
http://192.168.1.15:4000/api  # Ganti dengan IP laptop Anda
```

**Troubleshooting:**
- Pastikan Windows Firewall tidak memblokir port 4000
- Coba disable firewall sementara untuk testing
- Pastikan router tidak memblokir komunikasi antar device

## 🔐 API Endpoints

Lihat file `PANDUAN_FASE_0_2_MOBILE.md` untuk detail lengkap kontrak API.

### Quick Reference

| Endpoint | Method | Auth | Deskripsi |
|----------|--------|------|-----------|
| `/auth/register` | POST | ❌ | Register user baru |
| `/auth/login` | POST | ❌ | Login user |
| `/auth/me` | GET | ✅ | Get user profile |

## 🧪 Testing Checklist

### Backend Connection Test
- [ ] Backend services running (check `http://localhost:4000/health`)
- [ ] MySQL database created (`auth_db`)
- [ ] Mobile app bisa hit endpoint (cek network logs)

### Feature Test
- [ ] Register user baru berhasil
- [ ] Login dengan credentials benar
- [ ] Login gagal dengan credentials salah
- [ ] Get user profile setelah login
- [ ] Logout membersihkan token
- [ ] Loading states muncul
- [ ] Error handling tampil alert yang sesuai

### Network Logs (untuk debugging)

Tambahkan di `src/utils/api.ts` untuk debugging:

```typescript
export async function apiRequest<T>(...) {
  console.log('API Request:', url);  // <- Tambahkan ini
  const response = await fetch(url, options);
  console.log('API Response:', response.status);  // <- Dan ini
  // ...
}
```

Buka React Native Debugger untuk melihat logs.

## ⚠️ Common Issues

### Issue: "Network request failed"
**Cause:** Base URL salah atau backend tidak running  
**Fix:** 
1. Pastikan backend running
2. Cek Base URL sesuai environment
3. Untuk emulator, pastikan pakai `10.0.2.2` bukan `localhost`

### Issue: "502 Bad Gateway"
**Cause:** Gateway running tapi auth-service mati  
**Fix:** Pastikan kedua services (gateway dan auth-service) running

### Issue: "401 Unauthorized"
**Cause:** Token expired atau invalid  
**Fix:** Logout dan login ulang

### Issue: "Email sudah terdaftar"
**Cause:** Email sudah pernah diregister  
**Fix:** Gunakan email lain atau login dengan email tersebut

## 📚 Fase Development

### ✅ Fase 0-2 (Current)
- Auth service (register, login, get profile)
- Token management
- Basic user data

### ⏳ Fase 3 (Next)
- User service (profil lengkap: gender, tanggalLahir, alamat)
- Assessment service (health check data)
- Daily logs

### ⏳ Fase 4+
- Prediction service
- Admin evaluations
- Audit logs

---

**Last Updated:** 2026-11-17  
**Backend Version:** Fase 0-2  
**Mobile Version:** 1.0.0
