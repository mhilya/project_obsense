const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// LOGIN (Admins & Super Admins)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi.' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  try {
    // Ambil data admin dari database berdasarkan email
    const [admins] = await pool.query('SELECT * FROM admins WHERE LOWER(email) = LOWER(?)', [email.trim()]);

    if (admins.length === 0) {
      // Audit log failed login
      await pool.query(
        `INSERT INTO audit_logs (admin_id, admin_name, admin_email, action, entity_type, entity_id, details, ip_address, user_agent)
         VALUES (NULL, 'Guest / Unknown', ?, 'LOGIN_FAILED', 'Security', ?, ?, ?, ?)`,
        [email, email, JSON.stringify({ reason: 'Admin not found', email_entered: email }), clientIp, userAgent]
      );
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const admin = admins[0];

    // Cek password hash
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      await pool.query(
        `INSERT INTO audit_logs (admin_id, admin_name, admin_email, action, entity_type, entity_id, details, ip_address, user_agent)
         VALUES (?, ?, ?, 'LOGIN_FAILED', 'Security', ?, ?, ?, ?)`,
        [admin.id, admin.name, admin.email, String(admin.id), JSON.stringify({ reason: 'Invalid password' }), clientIp, userAgent]
      );
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    if (!admin.is_active) {
      return res.status(403).json({ message: 'Akun admin ini dinonaktifkan. Hubungi Super Administrator.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
      process.env.JWT_SECRET || 'obsense_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Update last_login_at
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await pool.query('UPDATE admins SET last_login_at = ? WHERE id = ?', [nowStr, admin.id]);

    // Record login audit log
    await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_name, admin_email, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES (?, ?, ?, 'LOGIN', 'Admin', ?, ?, ?, ?)`,
      [admin.id, admin.name, admin.email, String(admin.id), JSON.stringify({ status: 'SUCCESS', role: admin.role }), clientIp, userAgent]
    );

    return res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        is_active: Boolean(admin.is_active),
        last_login_at: nowStr,
        created_at: admin.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server saat login.' });
  }
};

// GET CURRENT USER PROFILE
exports.getMe = async (req, res) => {
  try {
    const [admins] = await pool.query(
      'SELECT id, name, email, role, is_active, last_login_at, created_at FROM admins WHERE id = ?',
      [req.user.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ message: 'Admin tidak ditemukan.' });
    }

    return res.json({
      success: true,
      user: {
        ...admins[0],
        is_active: Boolean(admins[0].is_active)
      }
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ message: 'Gagal mengambil data profil.' });
  }
};

// DEMO ROLE SWITCH (For rapid testing / demo preview)
exports.demoSwitch = async (req, res) => {
  const { role = 'super_admin' } = req.body;
  try {
    const [admins] = await pool.query('SELECT * FROM admins WHERE role = ? AND is_active = 1 LIMIT 1', [role]);
    const target = admins.length > 0 ? admins[0] : (await pool.query('SELECT * FROM admins LIMIT 1'))[0][0];

    if (!target) {
      return res.status(404).json({ message: 'Admin tidak ditemukan untuk switch role.' });
    }

    const token = jwt.sign(
      { id: target.id, email: target.email, role: target.role, name: target.name },
      process.env.JWT_SECRET || 'obsense_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: target.id,
        name: target.name,
        email: target.email,
        role: target.role,
        is_active: Boolean(target.is_active),
        last_login_at: target.last_login_at,
        created_at: target.created_at
      }
    });
  } catch (error) {
    console.error('demoSwitch error:', error);
    return res.status(500).json({ message: 'Gagal melakukan role switch.' });
  }
};
