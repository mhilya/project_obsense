import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, authenticatedRequest } from './api';

/**
 * Interface sesuai dengan response dari backend auth-service
 * Backend hanya return field: id, name, email, role, created_at
 */
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

/**
 * Interface untuk profil lengkap dari user-service (Fase 3)
 * Includes anthropometric data and health information
 */
export interface CompleteUserProfile extends UserProfile {
  phone?: string;
  gender?: string; // "Laki-laki" | "Perempuan" | "Male" | "Female"
  birth_date?: string; // "YYYY-MM-DD"
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  obesity_class?: string;
  risk_level?: string;
  address?: string;
  family_history_with_overweight?: boolean;
  smoke?: boolean;
  updated_at?: string;
}

/**
 * Interface untuk data registrasi lengkap (mobile app)
 * Untuk fase 0-2, hanya name, email, password yang dikirim ke auth-service
 * Data lengkap (gender, tanggalLahir, dll) akan ke user-service di Fase 3
 */
export interface UserRegistration {
  name: string;
  email: string;
  password: string;
  // Field berikut disimpan lokal dulu, nanti sync ke user-service (Fase 3)
  username?: string;
  tanggalLahir?: string;
  gender?: string;
  alamat?: string;
}

interface RegisterResponse {
  message: string;
  user: UserProfile;
}

interface LoginResponse {
  message: string;
  token: string;
  user: UserProfile;
}

interface MeResponse {
  user: UserProfile;
}

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_profile';

// ============================================================
// TOKEN MANAGEMENT
// ============================================================

/** Simpan token ke AsyncStorage */
export async function saveToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
}

/** Ambil token dari AsyncStorage */
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

/** Hapus token dari AsyncStorage */
export async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
}

// ============================================================
// USER PROFILE CACHE (untuk offline access)
// ============================================================

/** Simpan user profile ke AsyncStorage untuk cache */
async function cacheUserProfile(user: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error caching user profile:', error);
  }
}

/** Ambil cached user profile dari AsyncStorage */
export async function getCachedUser(): Promise<UserProfile | null> {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    if (data) {
      return JSON.parse(data) as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting cached user:', error);
    return null;
  }
}

/** Hapus cached user profile */
async function removeCachedUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing cached user:', error);
  }
}

// ============================================================
// API FUNCTIONS (sesuai kontrak PANDUAN_FASE_0_2_MOBILE.md)
// ============================================================

/** 
 * Register user baru via API
 * POST /auth/register
 * 
 * Request: { name, email, password }
 * Response 201: { message, user: { id, name, email, role } }
 */
export async function registerUser(data: UserRegistration): Promise<{
  success: boolean;
  error?: string;
  user?: UserProfile;
}> {
  try {
    // Hanya kirim name, email, password ke auth-service (Fase 0-2)
    const response = await apiRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    if (response.success && response.data) {
      // Cache user profile
      await cacheUserProfile(response.data.user);
      
      // TODO Fase 3: Kirim data lengkap (gender, tanggalLahir, dll) ke user-service
      
      return { success: true, user: response.data.user };
    }

    return { success: false, error: response.error || 'Registrasi gagal' };
  } catch (error) {
    console.error('Error registering user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Registration error' 
    };
  }
}

/** 
 * Login user via API
 * POST /auth/login
 * 
 * Request: { email, password }
 * Response 200: { message, token, user: { id, name, email, role } }
 */
export async function loginUser(
  email: string, 
  password: string
): Promise<{
  success: boolean;
  user?: UserProfile;
  error?: string;
}> {
  try {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      // Simpan token
      await saveToken(response.data.token);
      
      // Cache user profile
      await cacheUserProfile(response.data.user);
      
      return { success: true, user: response.data.user };
    }

    return { 
      success: false, 
      error: response.error || 'Email atau password salah' 
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Login error' 
    };
  }
}

/** 
 * Ambil data user terkini dari server
 * GET /auth/me
 * 
 * Response 200: { user: { id, name, email, role, created_at } }
 */
export async function getStoredUser(): Promise<UserProfile | null> {
  try {
    const token = await getToken();
    
    // Jika tidak ada token, coba ambil dari cache
    if (!token) {
      return await getCachedUser();
    }

    // Fetch user data dari server
    const response = await authenticatedRequest<MeResponse>(
      '/auth/me',
      token,
      { method: 'GET' }
    );

    if (response.success && response.data) {
      // Update cache
      await cacheUserProfile(response.data.user);
      return response.data.user;
    }

    // Jika gagal (misal token expired), fallback ke cache
    console.warn('Failed to fetch user from server, using cache');
    return await getCachedUser();
  } catch (error) {
    console.error('Error getting stored user:', error);
    // Fallback ke cache jika ada error
    return await getCachedUser();
  }
}

/** 
 * Update user profile
 * PUT /auth/profile
 * 
 * Request: { name, email }
 * Response 200: { message, user: { id, name, email, role, created_at } }
 */
export async function updateUserProfile(
  updates: { name: string; email: string }
): Promise<{
  success: boolean;
  user?: UserProfile;
  error?: string;
}> {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Token tidak ditemukan. Silakan login kembali.' };
    }

    const response = await authenticatedRequest<{ message: string; user: UserProfile }>(
      '/auth/profile',
      token,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );

    if (response.success && response.data) {
      // Update cache dengan data terbaru
      await cacheUserProfile(response.data.user);
      return { success: true, user: response.data.user };
    }

    return { 
      success: false, 
      error: response.error || 'Gagal memperbarui profil' 
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Update error' 
    };
  }
}

/** 
 * Change password
 * PUT /auth/change-password
 * 
 * Request: { currentPassword, newPassword }
 * Response 200: { message }
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Token tidak ditemukan. Silakan login kembali.' };
    }

    const response = await authenticatedRequest<{ message: string }>(
      '/auth/change-password',
      token,
      {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );

    if (response.success) {
      return { success: true };
    }

    return { 
      success: false, 
      error: response.error || 'Gagal mengubah password' 
    };
  } catch (error) {
    console.error('Error changing password:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Change password error' 
    };
  }
}

// ============================================================
// PASSWORD RESET (FORGOT PASSWORD) WITH OTP
// ============================================================

/**
 * Step 1: Request OTP for password reset
 * POST /auth/forgot-password/request-otp
 * 
 * Request: { email, accountType }
 * Response 200: { message, expiresIn }
 */
export async function requestPasswordResetOTP(
  email: string,
  accountType: 'user' | 'admin' = 'user'
): Promise<{
  success: boolean;
  error?: string;
  devOtp?: string; // Only in development
}> {
  try {
    const response = await apiRequest<{ 
      message: string; 
      devOnly_otp?: string;
      expiresIn: string;
    }>(
      '/auth/forgot-password/request-otp',
      {
        method: 'POST',
        body: JSON.stringify({ email, accountType }),
      }
    );

    if (response.success && response.data) {
      return { 
        success: true,
        devOtp: response.data.devOnly_otp, // For development/testing only
      };
    }

    return { 
      success: false, 
      error: response.error || 'Gagal mengirim OTP' 
    };
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Request OTP error' 
    };
  }
}

/**
 * Step 2: Verify OTP code
 * POST /auth/forgot-password/verify-otp
 * 
 * Request: { email, otpCode, accountType }
 * Response 200: { message, verified, resetToken }
 */
export async function verifyPasswordResetOTP(
  email: string,
  otpCode: string,
  accountType: 'user' | 'admin' = 'user'
): Promise<{
  success: boolean;
  resetToken?: string;
  error?: string;
}> {
  try {
    const response = await apiRequest<{ 
      message: string; 
      verified: boolean;
      resetToken: string;
    }>(
      '/auth/forgot-password/verify-otp',
      {
        method: 'POST',
        body: JSON.stringify({ email, otpCode, accountType }),
      }
    );

    if (response.success && response.data && response.data.verified) {
      return { 
        success: true,
        resetToken: response.data.resetToken,
      };
    }

    return { 
      success: false, 
      error: response.error || 'Kode OTP tidak valid' 
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Verify OTP error' 
    };
  }
}

/**
 * Step 3: Reset password with verified OTP
 * POST /auth/forgot-password/reset-password
 * 
 * Request: { email, otpCode, newPassword, accountType }
 * Response 200: { message }
 */
export async function resetPasswordWithOTP(
  email: string,
  otpCode: string,
  newPassword: string,
  accountType: 'user' | 'admin' = 'user'
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await apiRequest<{ message: string }>(
      '/auth/forgot-password/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({ email, otpCode, newPassword, accountType }),
      }
    );

    if (response.success) {
      return { success: true };
    }

    return { 
      success: false, 
      error: response.error || 'Gagal reset password' 
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Reset password error' 
    };
  }
}

// ============================================================
// USER SERVICE API (FASE 3 - Anthropometric Data)
// ============================================================

/**
 * Ambil profil lengkap user dari user-service
 * GET /users/me
 * 
 * Response 200: { user: { ...profile, height, weight, bmi, obesity_class, risk_level } }
 * Response 404: Profile belum dibuat, fallback ke auth-service
 */
export async function getUserProfile(): Promise<CompleteUserProfile | null> {
  try {
    const token = await getToken();
    if (!token) {
      console.warn('No token found, returning cached user');
      return await getCachedUser();
    }

    // Try to get complete profile from user-service
    const response = await authenticatedRequest<{ user: CompleteUserProfile }>(
      '/users/me',
      token,
      { method: 'GET' }
    );

    if (response.success && response.data) {
      // Update cache with complete profile
      await cacheUserProfile(response.data.user);
      return response.data.user;
    }

    // If 404 or error, fallback to auth-service (basic profile)
    console.warn('User profile not found in user-service, falling back to auth-service');
    const authResponse = await authenticatedRequest<MeResponse>(
      '/auth/me',
      token,
      { method: 'GET' }
    );

    if (authResponse.success && authResponse.data) {
      await cacheUserProfile(authResponse.data.user);
      return authResponse.data.user;
    }

    // Final fallback to cache
    return await getCachedUser();
  } catch (error) {
    console.error('Error getting user profile:', error);
    return await getCachedUser();
  }
}

/**
 * Update/create user profile dengan data antropometri
 * PUT /users/me
 * 
 * Request: { name?, email?, phone?, gender?, birth_date?, height?, weight?, address?, family_history_with_overweight?, smoke? }
 * Response 200/201: { message, user: { ...profile, bmi, obesity_class, risk_level } }
 */
export async function updateCompleteUserProfile(
  updates: Partial<{
    name: string;
    email: string;
    phone: string;
    gender: string; // "Laki-laki" | "Perempuan"
    birth_date: string; // "YYYY-MM-DD"
    height: number; // cm
    weight: number; // kg
    address: string;
    family_history_with_overweight: boolean;
    smoke: boolean;
  }>
): Promise<{
  success: boolean;
  user?: CompleteUserProfile;
  error?: string;
}> {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Token tidak ditemukan. Silakan login kembali.' };
    }

    const response = await authenticatedRequest<{ 
      message: string; 
      user: CompleteUserProfile 
    }>(
      '/users/me',
      token,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );

    if (response.success && response.data) {
      // Update cache with complete profile including BMI calculation
      await cacheUserProfile(response.data.user);
      return { success: true, user: response.data.user };
    }

    return { 
      success: false, 
      error: response.error || 'Gagal memperbarui profil' 
    };
  } catch (error) {
    console.error('Error updating complete user profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Update error' 
    };
  }
}

/** 
 * Logout - hapus token dan cached user
 */
export async function logout(): Promise<void> {
  try {
    await removeToken();
    await removeCachedUser();
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

/** 
 * Hapus semua data user (alias untuk logout)
 * @deprecated Use logout() instead
 */
export async function clearUserData(): Promise<void> {
  await logout();
}
