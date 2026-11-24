const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const secret = () => process.env.JWT_SECRET || 'obsense_secret';
const expiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

const logAttempt = async (req, email, accountType, status) => {
  try {
    await pool.query(
      'INSERT INTO login_attempts (email, account_type, status, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      [email, accountType, status, req.ip, (req.headers['user-agent'] || '').slice(0, 255)]
    );
  } catch (e) {
    console.error('logAttempt error:', e.message);
  }
};

// REGISTER (user / pasien)
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, 'user']
    );

    return res.status(201).json({
      message: 'Registrasi berhasil! Silakan masuk.',
      user: { id: result.insertId, name, email, role: 'user' },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server saat registrasi.' });
  }
};

// LOGIN (user / pasien)
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      await logAttempt(req, email, 'user', 'FAILED');
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, type: 'user' },
      secret(),
      { expiresIn: expiresIn() }
    );
    await logAttempt(req, email, 'user', 'SUCCESS');

    return res.json({
      message: 'Login berhasil!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server saat login.' });
  }
};

// LOGIN ADMIN
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    const admin = rows[0];

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      await logAttempt(req, email, 'admin', 'FAILED');
      return res.status(401).json({ message: 'Email atau password salah.' });
    }
    if (!admin.is_active) {
      await logAttempt(req, email, 'admin', 'FAILED');
      return res.status(403).json({ message: 'Akun admin tidak aktif.' });
    }

    await pool.query('UPDATE admins SET last_login_at = NOW() WHERE id = ?', [admin.id]);

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, name: admin.name, type: 'admin' },
      secret(),
      { expiresIn: expiresIn() }
    );
    await logAttempt(req, email, 'admin', 'SUCCESS');

    return res.json({
      message: 'Login admin berhasil!',
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server saat login.' });
  }
};

// PROFIL AKUN YANG SEDANG LOGIN
exports.getMe = async (req, res) => {
  try {
    const isAdmin = req.user.type === 'admin';
    const [rows] = await pool.query(
      isAdmin
        ? 'SELECT id, name, email, role, is_active, last_login_at, created_at FROM admins WHERE id = ?'
        : 'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Akun tidak ditemukan.' });
    }
    return res.json({ user: rows[0] });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ message: 'Gagal mengambil data profil.' });
  }
};

// UPDATE PROFILE (nama dan email)
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: 'Nama dan email wajib diisi.' });
  }

  try {
    const isAdmin = req.user.type === 'admin';
    const table = isAdmin ? 'admins' : 'users';
    
    // Cek apakah email sudah digunakan oleh user lain
    const [existing] = await pool.query(
      `SELECT id FROM ${table} WHERE email = ? AND id != ?`,
      [email, req.user.id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email sudah digunakan oleh akun lain.' });
    }

    // Update profile
    await pool.query(
      `UPDATE ${table} SET name = ?, email = ? WHERE id = ?`,
      [name, email, req.user.id]
    );

    // Ambil data terbaru
    const [rows] = await pool.query(
      isAdmin
        ? 'SELECT id, name, email, role, is_active, last_login_at, created_at FROM admins WHERE id = ?'
        : 'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.json({
      message: 'Profil berhasil diperbarui.',
      user: rows[0],
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ message: 'Gagal memperbarui profil.' });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Password lama dan password baru wajib diisi.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });
  }

  try {
    const isAdmin = req.user.type === 'admin';
    const table = isAdmin ? 'admins' : 'users';
    
    // Ambil password saat ini dari database
    const [rows] = await pool.query(
      `SELECT password FROM ${table} WHERE id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Akun tidak ditemukan.' });
    }

    const user = rows[0];

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password lama tidak sesuai.' });
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      `UPDATE ${table} SET password = ? WHERE id = ?`,
      [hashedNewPassword, req.user.id]
    );

    return res.json({
      message: 'Password berhasil diubah.',
    });
  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ message: 'Gagal mengubah password.' });
  }
};

