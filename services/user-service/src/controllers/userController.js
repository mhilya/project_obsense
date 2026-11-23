const { pool } = require('../config/db');
const { classifyBmi, calcBmi, calcAge, normalizeGender } = require('../utils/bmi');

const format = (u) => {
  const bmi = calcBmi(u.height, u.weight);
  const cls = bmi ? classifyBmi(bmi) : { obesity_class: null, risk_level: null };
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    gender: u.gender,
    birth_date: u.birth_date,
    age: u.age,
    height: u.height === null ? null : Number(u.height),
    weight: u.weight === null ? null : Number(u.weight),
    address: u.address,
    bmi,
    obesity_class: cls.obesity_class,
    risk_level: cls.risk_level,
    family_history_with_overweight: Boolean(u.family_history_with_overweight),
    smoke: Boolean(u.smoke),
    status: u.status,
    deleted_at: u.deleted_at,
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
};

// Validasi field profil umum. Return pesan error atau null.
const validateProfile = (b) => {
  if (b.height !== undefined && b.height !== null && !(Number(b.height) >= 50 && Number(b.height) <= 250)) {
    return 'Tinggi badan harus 50–250 cm.';
  }
  if (b.weight !== undefined && b.weight !== null && !(Number(b.weight) >= 10 && Number(b.weight) <= 400)) {
    return 'Berat badan harus 10–400 kg.';
  }
  if (b.age !== undefined && b.age !== null && !(Number(b.age) >= 1 && Number(b.age) <= 120)) {
    return 'Usia harus 1–120 tahun.';
  }
  if (b.gender !== undefined && b.gender !== null && b.gender !== '' && normalizeGender(b.gender) === undefined) {
    return 'Gender tidak valid (Male/Female atau Laki-laki/Perempuan).';
  }
  return null;
};

// ---------------- ENDPOINT PENGGUNA (MOBILE) ----------------

// GET /api/users/me
exports.getMe = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Profil belum dibuat. Lengkapi profil dengan PUT /api/users/me.' });
    }
    return res.json({ success: true, data: format(rows[0]) });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ message: 'Gagal memuat profil.' });
  }
};

// PUT /api/users/me  (upsert: buat jika belum ada, ubah jika sudah)
exports.upsertMe = async (req, res) => {
  try {
    const err = validateProfile(req.body);
    if (err) return res.status(400).json({ message: err });

    const id = req.user.id;
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    const prev = rows[0];
    const b = req.body;
    const pick = (key, fallback) => (b[key] !== undefined ? b[key] : fallback);

    const birthDate = pick('birth_date', prev ? prev.birth_date : null) || null;
    const gender = b.gender !== undefined ? normalizeGender(b.gender) : prev ? prev.gender : null;
    const age =
      b.age !== undefined && b.age !== null && b.age !== ''
        ? Number(b.age)
        : calcAge(birthDate) ?? (prev ? prev.age : null);

    const data = {
      name: pick('name', prev ? prev.name : req.user.name),
      email: pick('email', prev ? prev.email : req.user.email),
      phone: pick('phone', prev ? prev.phone : null) || null,
      gender: gender || null,
      birth_date: birthDate,
      age,
      height: pick('height', prev ? prev.height : null) || null,
      weight: pick('weight', prev ? prev.weight : null) || null,
      address: pick('address', prev ? prev.address : null) || null,
      family_history: b.family_history_with_overweight !== undefined
        ? (b.family_history_with_overweight ? 1 : 0)
        : prev ? prev.family_history_with_overweight : 0,
      smoke: b.smoke !== undefined ? (b.smoke ? 1 : 0) : prev ? prev.smoke : 0,
    };

    if (prev) {
      await pool.query(
        `UPDATE users SET name=?, email=?, phone=?, gender=?, birth_date=?, age=?, height=?, weight=?, address=?,
         family_history_with_overweight=?, smoke=?, deleted_at=NULL WHERE id=?`,
        [data.name, data.email, data.phone, data.gender, data.birth_date, data.age, data.height, data.weight,
          data.address, data.family_history, data.smoke, id]
      );
    } else {
      await pool.query(
        `INSERT INTO users (id, name, email, phone, gender, birth_date, age, height, weight, address, family_history_with_overweight, smoke)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, data.name, data.email, data.phone, data.gender, data.birth_date, data.age, data.height, data.weight,
          data.address, data.family_history, data.smoke]
      );
    }

    const [saved] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return res.status(prev ? 200 : 201).json({
      success: true,
      message: prev ? 'Profil diperbarui.' : 'Profil dibuat.',
      data: format(saved[0]),
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email sudah dipakai profil lain.' });
    }
    console.error('upsertMe error:', error);
    return res.status(500).json({ message: 'Gagal menyimpan profil.' });
  }
};

// ---------------- ENDPOINT ADMIN (WEB) ----------------

// GET /api/users?search=&gender=&status=&includeDeleted=
exports.getUsers = async (req, res) => {
  try {
    const { includeDeleted = 'false', search = '', gender = '', status = '' } = req.query;
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (includeDeleted !== 'true') query += ' AND deleted_at IS NULL';
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (gender) {
      query += ' AND gender = ?';
      params.push(normalizeGender(gender) || gender);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY id ASC';

    const [rows] = await pool.query(query, params);
    const data = rows.map(format);
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ message: 'Gagal memuat data pengguna.' });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    return res.json({ success: true, data: format(rows[0]) });
  } catch (error) {
    console.error('getUserById error:', error);
    return res.status(500).json({ message: 'Gagal memuat detail pengguna.' });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const b = req.body;
    const gender = normalizeGender(b.gender);
    if (!b.name || !b.email || !gender || !b.height || !b.weight || (!b.age && !b.birth_date)) {
      return res.status(400).json({ message: 'Nama, email, gender, usia/tanggal lahir, tinggi, dan berat wajib diisi.' });
    }
    const err = validateProfile(b);
    if (err) return res.status(400).json({ message: err });

    const age = b.age ? Number(b.age) : calcAge(b.birth_date);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, phone, gender, birth_date, age, height, weight, address, family_history_with_overweight, smoke, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.name, b.email, b.phone || null, gender, b.birth_date || null, age, Number(b.height), Number(b.weight),
        b.address || null, b.family_history_with_overweight ? 1 : 0, b.smoke ? 1 : 0, b.status === 'inactive' ? 'inactive' : 'active']
    );
    const [saved] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Pengguna berhasil ditambahkan.', data: format(saved[0]) });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email pengguna sudah terdaftar.' });
    }
    console.error('createUser error:', error);
    return res.status(500).json({ message: 'Gagal menambahkan pengguna.' });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    const before = rows[0];
    const b = req.body;

    const err = validateProfile(b);
    if (err) return res.status(400).json({ message: err });

    const gender = b.gender !== undefined ? normalizeGender(b.gender) : before.gender;
    const birthDate = b.birth_date !== undefined ? b.birth_date || null : before.birth_date;
    const age = b.age ? Number(b.age) : b.birth_date ? calcAge(birthDate) : before.age;

    await pool.query(
      `UPDATE users SET name=?, email=?, phone=?, gender=?, birth_date=?, age=?, height=?, weight=?, address=?,
       family_history_with_overweight=?, smoke=?, status=? WHERE id=?`,
      [
        b.name ?? before.name,
        b.email ?? before.email,
        b.phone !== undefined ? b.phone || null : before.phone,
        gender,
        birthDate,
        age,
        b.height !== undefined ? Number(b.height) : before.height,
        b.weight !== undefined ? Number(b.weight) : before.weight,
        b.address !== undefined ? b.address || null : before.address,
        b.family_history_with_overweight !== undefined
          ? (b.family_history_with_overweight ? 1 : 0)
          : before.family_history_with_overweight,
        b.smoke !== undefined ? (b.smoke ? 1 : 0) : before.smoke,
        b.status ?? before.status,
        req.params.id,
      ]
    );
    const [saved] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Data pengguna berhasil diperbarui.', data: format(saved[0]) });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email sudah dipakai pengguna lain.' });
    }
    console.error('updateUser error:', error);
    return res.status(500).json({ message: 'Gagal memperbarui pengguna.' });
  }
};

// DELETE /api/users/:id  (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE users SET deleted_at = NOW(), status = 'inactive' WHERE id = ? AND deleted_at IS NULL",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan atau sudah dihapus.' });
    }
    return res.json({ success: true, message: 'Pengguna berhasil dinonaktifkan (soft delete).' });
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({ message: 'Gagal menghapus pengguna.' });
  }
};

// POST /api/users/:id/restore
exports.restoreUser = async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE users SET deleted_at = NULL, status = 'active' WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    return res.json({ success: true, message: 'Pengguna berhasil dipulihkan.' });
  } catch (error) {
    console.error('restoreUser error:', error);
    return res.status(500).json({ message: 'Gagal memulihkan pengguna.' });
  }
};
