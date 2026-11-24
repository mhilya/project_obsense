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
