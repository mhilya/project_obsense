export interface RegisteredUser {
  nama: string;
  email: string;
  password: string;
}

const users: RegisteredUser[] = [];

/** Simpan user baru. Return false jika email sudah dipakai. */
export function registerUser(user: RegisteredUser): boolean {
  const sudahAda = users.some(
    u => u.email.toLowerCase() === user.email.toLowerCase(),
  );
  if (sudahAda) return false;
  users.push(user);
  return true;
}

/** Cek kredensial. Return user jika cocok, null jika salah. */
export function loginUser(email: string, password: string): RegisteredUser | null {
  return (
    users.find(
      u =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password,
    ) ?? null
  );
}
