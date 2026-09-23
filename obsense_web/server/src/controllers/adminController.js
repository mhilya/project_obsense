const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// GET ALL ADMINS
exports.getAdmins = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, is_active, last_login_at, created_at, updated_at FROM admins ORDER BY id ASC'
    );
    const formatted = rows.map(a => ({ ...a, is_active: Boolean(a.is_active) }));
    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('getAdmins error:', error);
    return res.status(500).json({ message: 'Gagal memuat data admin.' });
  }
};

// CREATE ADMIN (Super Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, role = 'admin', is_active = true } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
    }

    const [existing] = await pool.query('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email admin sudah terdaftar.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO admins (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, is_active ? 1 : 0]
    );

    const newAdminId = result.insertId;

    // Audit log
    const adminUser = req.user || { id: null, name: 'Admin', email: 'admin@obsense.com' };
    await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_name, admin_email, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, 'CREATE_ADMIN', 'Admin', ?, ?)`,
      [adminUser.id, adminUser.name, adminUser.email, String(newAdminId), JSON.stringify({ name, email, role })]
    );

    return res.status(201).json({
      success: true,
      message: 'Admin baru berhasil ditambahkan.',
      data: { id: newAdminId, name, email, role, is_active: Boolean(is_active) }
    });
  } catch (error) {
    console.error('createAdmin error:', error);
    return res.status(500).json({ message: 'Gagal menambahkan admin baru.' });
  }
};

// UPDATE ADMIN
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const [existingRows] = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Admin tidak ditemukan.' });
    }

    const before = existingRows[0];
    const { name = before.name, email = before.email, role = before.role, is_active = before.is_active, password } = req.body;

    let updateQuery = 'UPDATE admins SET name = ?, email = ?, role = ?, is_active = ?';
    const params = [name, email, role, is_active ? 1 : 0];

    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password.trim(), salt);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await pool.query(updateQuery, params);

    // Audit Log
    const adminUser = req.user || { id: null, name: 'Admin', email: 'admin@obsense.com' };
    await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_name, admin_email, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, 'UPDATE_ADMIN', 'Admin', ?, ?)`,
      [
        adminUser.id, adminUser.name, adminUser.email, String(id),
        JSON.stringify({
          before: { name: before.name, role: before.role, is_active: Boolean(before.is_active) },
          after: { name, role, is_active: Boolean(is_active) }
        })
      ]
    );

    return res.json({
      success: true,
      message: 'Data admin berhasil diperbarui.',
      data: { id: Number(id), name, email, role, is_active: Boolean(is_active) }
    });
  } catch (error) {
    console.error('updateAdmin error:', error);
    return res.status(500).json({ message: 'Gagal memperbarui admin.' });
  }
};

// DELETE ADMIN
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (Number(id) === req.user?.id) {
      return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.' });
    }

    const [adminRows] = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
    if (adminRows.length === 0) {
      return res.status(404).json({ message: 'Admin tidak ditemukan.' });
    }

    await pool.query('DELETE FROM admins WHERE id = ?', [id]);

    const adminUser = req.user || { id: null, name: 'Admin', email: 'admin@obsense.com' };
    await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_name, admin_email, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, 'DELETE_ADMIN', 'Admin', ?, ?)`,
      [adminUser.id, adminUser.name, adminUser.email, String(id), JSON.stringify({ deleted_admin: adminRows[0].email })]
    );

    return res.json({ success: true, message: 'Admin berhasil dihapus.' });
  } catch (error) {
    console.error('deleteAdmin error:', error);
    return res.status(500).json({ message: 'Gagal menghapus admin.' });
  }
};
