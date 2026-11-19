import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  username: string;
  nama: string;
  email: string;
  tanggalLahir: string; // ISO string
  gender: string;
  alamat: string;
  password: string;
  createdAt: string; // ISO string
}

const STORAGE_KEY = '@user_profile';

/** Simpan user baru ke AsyncStorage. Return false jika email sudah dipakai. */
export async function registerUser(user: UserProfile): Promise<boolean> {
  try {
    // Cek apakah sudah ada user terdaftar
    const existingUser = await getStoredUser();
    if (existingUser && existingUser.email.toLowerCase() === user.email.toLowerCase()) {
      return false;
    }

    // Simpan user baru dengan timestamp
    const userWithTimestamp: UserProfile = {
      ...user,
      createdAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userWithTimestamp));
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
}

/** Cek kredensial. Return user jika cocok, null jika salah. */
export async function loginUser(email: string, password: string): Promise<UserProfile | null> {
  try {
    const user = await getStoredUser();
    if (
      user &&
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password
    ) {
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
}

/** Ambil data user dari AsyncStorage */
export async function getStoredUser(): Promise<UserProfile | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/** Update data user di AsyncStorage */
export async function updateUserProfile(user: Partial<UserProfile>): Promise<boolean> {
  try {
    const existingUser = await getStoredUser();
    if (!existingUser) {
      return false;
    }

    const updatedUser: UserProfile = {
      ...existingUser,
      ...user,
      // Jangan override password dan createdAt jika tidak disediakan
      password: user.password ?? existingUser.password,
      createdAt: existingUser.createdAt,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
}

/** Hapus data user dari AsyncStorage (untuk logout complete) */
export async function clearUserData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
}
