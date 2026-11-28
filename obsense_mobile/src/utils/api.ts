/**
 * API Helper untuk komunikasi dengan backend
 * Sesuai dengan PANDUAN_FASE_0_2_MOBILE.md
 */

// Base URL API Gateway - sesuaikan dengan environment Anda
// Android Emulator: http://10.0.2.2:4000/api
// iOS Simulator: http://localhost:4000/api
// Device fisik (same WiFi): http://<IP_LAN_LAPTOP>:4000/api
export const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:4000/api'  // Development - Android Emulator (ganti sesuai kebutuhan)
  : 'https://api.obsense.com/api'; // Production

/**
 * Helper untuk melakukan HTTP request dengan error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; statusCode?: number }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`,
        statusCode: response.status,
      };
    }

    return {
      success: true,
      data: data as T,
      statusCode: response.status,
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Helper untuk authenticated requests (dengan token)
 */
export async function authenticatedRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; statusCode?: number }> {
  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
