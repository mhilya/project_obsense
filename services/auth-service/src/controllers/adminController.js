const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../config/db');

const ROLES = ['super_admin', 'admin'];
const PUBLIC_COLS = 'id, name, email, role, is_active, last_login_at, created_at';

// Pastikan masih ada minimal satu super_admin aktif selain `excludeId`
const hasOtherActiveSuperAdmin = async (excludeId) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM admins WHERE role = 'super_admin' AND is_active = TRUE AND id <> ?",
    [excludeId]
  );
  return rows[0].total > 0;
};

exports.listAdmins = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT ${PUBLIC_COLS} FROM admins ORDER BY id ASC`);
    return res.json({ admins: rows.map((r) => ({ ...r, is_active: !!r.is_active })) });
  } catch (error) {
    console.error('listAdmins error:', error);
    return res.status(500).json({ message: 'Gagal mengambil daftar admin.' });
  }
};

exports.createAdmin = async (req, res) => {
  const { name, email, password, role = 'admin', is_active = true } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password minimal 6 karakter.' });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: 'Role tidak valid.' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email admin sudah terdaftar.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admins (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, role, !!is_active]
    );
    const [rows] = await pool.query(`SELECT ${PUBLIC_COLS} FROM admins WHERE id = ?`, [result.insertId]);
    return res.status(201).json({ message: 'Admin berhasil dibuat.', admin: { ...rows[0], is_active: !!rows[0].is_active } });
  } catch (error) {
    console.error('createAdmin error:', error);
    return res.status(500).json({ message: 'Gagal membuat admin.' });
  }
};

exports.updateAdmin = async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, role, is_active } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
    const target = rows[0];
    if (!target) return res.status(404).json({ message: 'Admin tidak ditemukan.' });

    const next = {
      name: name ?? target.name,
      email: email ?? target.email,
      role: role ?? target.role,
      is_active: is_active === undefined ? !!target.is_active : !!is_active,
    };

    if (!ROLES.includes(next.role)) {
      return res.status(400).json({ message: 'Role tidak valid.' });
    }

    const isSelf = id === req.user.id;
    if (isSelf && (!next.is_active || next.role !== 'super_admin')) {
      return res.status(400).json({ message: 'Anda tidak dapat menonaktifkan atau menurunkan role akun Anda sendiri.' });
    }

    const losesSuper = target.role === 'super_admin' && target.is_active && (next.role !== 'super_admin' || !next.is_active);
    if (losesSuper && !(await hasOtherActiveSuperAdmin(id))) {
      return res.status(400).json({ message: 'Harus ada minimal satu Super Administrator aktif.' });
    }

    if (next.email !== target.email) {
      const [dup] = await pool.query('SELECT id FROM admins WHERE email = ? AND id <> ?', [next.email, id]);
      if (dup.length > 0) return res.status(400).json({ message: 'Email sudah dipakai admin lain.' });
    }

    await pool.query(
      'UPDATE admins SET name = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
      [next.name, next.email, next.role, next.is_active, id]
    );
    const [updated] = await pool.query(`SELECT ${PUBLIC_COLS} FROM admins WHERE id = ?`, [id]);
    return res.json({ message: 'Admin berhasil diperbarui.', admin: { ...updated[0], is_active: !!updated[0].is_active } });
  } catch (error) {
    console.error('updateAdmin error:', error);
    return res.status(500).json({ message: 'Gagal memperbarui admin.' });
  }
};

// Reset password: dibuat password sementara acak, dikembalikan sekali di response
exports.resetPassword = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [rows] = await pool.query('SELECT id FROM admins WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Admin tidak ditemukan.' });

    const temporaryPassword = crypto.randomBytes(6).toString('base64url');
    const hash = await bcrypt.hash(temporaryPassword, 10);
    await pool.query('UPDATE admins SET password = ? WHERE id = ?', [hash, id]);

    return res.json({ message: 'Password berhasil di-reset.', temporary_password: temporaryPassword });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ message: 'Gagal me-reset password.' });
  }
};
