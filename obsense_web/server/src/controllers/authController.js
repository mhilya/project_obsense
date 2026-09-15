const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// REGISTER
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
  }

  try {
    // Cek apakah email sudah terdaftar
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user baru ke database MySQL
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    return res.status(201).json({
      message: 'Registrasi berhasil! Silakan masuk.',
      user: {
        id: result.insertId,
        name,
        email,
        role: 'user',
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server saat registrasi.' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }

  try {
    // Ambil data user berdasarkan email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const user = users[0];

    // Bandingkan password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'obsense_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server saat login.' });
  }
};

// GET CURRENT USER PROFILE
exports.getMe = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [
      req.user.id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    return res.json({ user: users[0] });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ message: 'Gagal mengambil data profil.' });
  }
};
