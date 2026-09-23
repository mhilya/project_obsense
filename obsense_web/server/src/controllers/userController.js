const { pool } = require('../config/db');

// Helper to determine obesity class and risk level from BMI
function classifyBmi(bmi) {
  if (bmi < 18.5) return { obesity_class: 'Insufficient_Weight', risk_level: 'Low' };
  if (bmi < 25.0) return { obesity_class: 'Normal_Weight', risk_level: 'Low' };
  if (bmi < 27.5) return { obesity_class: 'Overweight_Level_I', risk_level: 'Moderate' };
  if (bmi < 30.0) return { obesity_class: 'Overweight_Level_II', risk_level: 'Moderate' };
  if (bmi < 35.0) return { obesity_class: 'Obesity_Type_I', risk_level: 'High' };
  if (bmi < 40.0) return { obesity_class: 'Obesity_Type_II', risk_level: 'High' };
  return { obesity_class: 'Obesity_Type_III', risk_level: 'Critical' };
}

// GET ALL USERS
exports.getUsers = async (req, res) => {
  try {
    const { includeDeleted = 'false', search = '', gender = '', status = '' } = req.query;

    let query = `
      SELECT 
        u.*,
        (
          SELECT COUNT(*) 
          FROM assessment_cycles ac 
          WHERE ac.user_id = u.id
        ) as cycle_count,
        (
          SELECT a.obesity_class 
          FROM assessments a 
          WHERE a.user_id = u.id 
          ORDER BY a.assessment_date DESC, a.id DESC 
          LIMIT 1
        ) as latest_obesity_class,
        (
          SELECT a.risk_level 
          FROM assessments a 
          WHERE a.user_id = u.id 
          ORDER BY a.assessment_date DESC, a.id DESC 
          LIMIT 1
        ) as latest_risk_level
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (includeDeleted !== 'true') {
      query += ' AND u.deleted_at IS NULL';
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (gender) {
      query += ' AND u.gender = ?';
      params.push(gender);
    }

    if (status) {
      query += ' AND u.status = ?';
      params.push(status);
    }

    query += ' ORDER BY u.id ASC';

    const [rows] = await pool.query(query, params);

    const formatted = rows.map((u) => {
      const heightInMeters = u.height / 100;
      const calculatedBmi = Number((u.weight / (heightInMeters * heightInMeters)).toFixed(1));
      const fallbackClass = classifyBmi(calculatedBmi);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        gender: u.gender,
        age: u.age,
        height: Number(u.height),
        weight: Number(u.weight),
        bmi: calculatedBmi,
        obesity_class: u.latest_obesity_class || fallbackClass.obesity_class,
        risk_level: u.latest_risk_level || fallbackClass.risk_level,
        family_history_with_overweight: Boolean(u.family_history_with_overweight),
        status: u.status,
        deleted_at: u.deleted_at,
        created_at: u.created_at,
        cycle_count: Number(u.cycle_count) || 0
      };
    });

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ message: 'Gagal memuat data pengguna.' });
  }
};

// GET USER BY ID (With Full Assessment History & Cycles)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    const u = userRows[0];
    const heightInMeters = u.height / 100;
    const calculatedBmi = Number((u.weight / (heightInMeters * heightInMeters)).toFixed(1));

    // Get Cycles
    const [cycles] = await pool.query(
      'SELECT * FROM assessment_cycles WHERE user_id = ? ORDER BY cycle_number DESC',
      [id]
    );

    // Get Assessments
    const [assessments] = await pool.query(
      'SELECT * FROM assessments WHERE user_id = ? ORDER BY assessment_date DESC',
      [id]
    );

    // Get Daily Logs
    const [dailyLogs] = await pool.query(
      'SELECT * FROM daily_logs WHERE user_id = ? ORDER BY log_date ASC',
      [id]
    );

    // Get Evaluations
    const [evaluations] = await pool.query(
      `SELECT e.*, a.name as adminName 
       FROM admin_evaluations e 
       LEFT JOIN admins a ON e.admin_id = a.id 
       WHERE e.user_id = ? 
       ORDER BY e.created_at DESC`,
      [id]
    );

    const latestAssessment = assessments[0];
    const fallbackClass = classifyBmi(calculatedBmi);

    const userDetails = {
      ...u,
      height: Number(u.height),
      weight: Number(u.weight),
      bmi: calculatedBmi,
      obesity_class: latestAssessment ? latestAssessment.obesity_class : fallbackClass.obesity_class,
      risk_level: latestAssessment ? latestAssessment.risk_level : fallbackClass.risk_level,
      family_history_with_overweight: Boolean(u.family_history_with_overweight),
      cycles: cycles.map(c => ({
        ...c,
        completion_rate: Number(c.completion_rate),
        aggregated_features: typeof c.aggregated_features === 'string' ? JSON.parse(c.aggregated_features) : c.aggregated_features
      })),
      assessments: assessments.map(a => ({
        ...a,
        bmi: Number(a.bmi),
        probability_scores: typeof a.probability_scores === 'string' ? JSON.parse(a.probability_scores) : a.probability_scores,
        recommendations: typeof a.recommendations === 'string' ? JSON.parse(a.recommendations) : a.recommendations
      })),
      daily_logs: dailyLogs.map(l => ({
        ...l,
        favc: Boolean(l.favc),
        scc: Boolean(l.scc),
        ch2o: Number(l.ch2o)
      })),
      evaluations
    };

    return res.json({ success: true, data: userDetails });
  } catch (error) {
    console.error('getUserById error:', error);
    return res.status(500).json({ message: 'Gagal memuat detail pengguna.' });
  }
};

// CREATE USER
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, gender, age, height, weight, family_history_with_overweight, status = 'active' } = req.body;

    if (!name || !email || !gender || !age || !height || !weight) {
      return res.status(400).json({ message: 'Mohon lengkapi semua data wajib pengguna.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email pengguna sudah terdaftar.' });
    }

    const [result] = await pool.query(
      `INSERT INTO users (name, email, phone, gender, age, height, weight, family_history_with_overweight, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, email, phone || null, gender, Number(age), Number(height), Number(weight),
        family_history_with_overweight ? 1 : 0, status
      ]
    );

    const newUserId = result.insertId;

    // Audit log
    const adminUser = req.user || { id: null, name: 'Admin', email: 'admin@obsense.com' };
    await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_name, admin_email, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, 'CREATE_USER', 'User', ?, ?)`,
      [
        adminUser.id, adminUser.name, adminUser.email, String(newUserId),
        JSON.stringify({ created_user: { id: newUserId, name, email } })
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Pengguna berhasil ditambahkan.',
      data: { id: newUserId, name, email, phone, gender, age, height, weight, status }
    });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({ message: 'Gagal menambahkan pengguna.' });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [existingRows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    }

    const before = existingRows[0];
    const {
      name = before.name,
      email = before.email,
      phone = before.phone,
      gender = before.gender,
      age = before.age,
      height = before.height,
      weight = before.weight,
      family_history_with_overweight = before.family_history_with_overweight,
      status = before.status
    } = req.body;

    await pool.query(
      `UPDATE users 
       SET name = ?, email = ?, phone = ?, gender = ?, age = ?, height = ?, weight = ?, 
           family_history_with_overweight = ?, status = ?
       WHERE id = ?`,
      [
        name, email, phone, gender, Number(age), Number(height), Number(weight),
        family_history_with_overweight ? 1 : 0, status, id
      ]
    );

    // Audit Log
    const adminUser = req.user || { id: null, name: 'Admin', email: 'admin@obsense.com' };
    await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_name, admin_email, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, 'UPDATE_USER', 'User', ?, ?)`,
      [
        adminUser.id, adminUser.name, adminUser.email, String(id),
        JSON.stringify({
          before: { name: before.name, weight: before.weight, height: before.height, status: before.status },
          after: { name, weight, height, status }
        })
      ]
    );

    return res.json({
      success: true,
      message: 'Data pengguna berhasil diperbarui.',
      data: { id: Number(id), name, email, phone, gender, age, height: Number(height), weight: Number(weight), status }
    });
  } catch (error) {
    console.error('updateUser error:', error);
    return res.status(500).json({ message: 'Gagal memperbarui pengguna.' });
  }
};

// SOFT DELETE / RESTORE USER
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await pool.query('UPDATE users SET deleted_at = ?, status = "inactive" WHERE id = ?', [nowStr, id]);

    const adminUser = req.user || { id: null, name: 'Admin', email: 'admin@obsense.com' };
    await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_name, admin_email, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, 'DELETE_USER', 'User', ?, ?)`,
      [adminUser.id, adminUser.name, adminUser.email, String(id), JSON.stringify({ deleted_at: nowStr })]
    );

    return res.json({ success: true, message: 'Pengguna berhasil dinonaktifkan / dihapus (soft delete).' });
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({ message: 'Gagal menghapus pengguna.' });
  }
};

exports.restoreUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE users SET deleted_at = NULL, status = "active" WHERE id = ?', [id]);

    const adminUser = req.user || { id: null, name: 'Admin', email: 'admin@obsense.com' };
    await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_name, admin_email, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, 'RESTORE_USER', 'User', ?, ?)`,
      [adminUser.id, adminUser.name, adminUser.email, String(id), JSON.stringify({ restored: true })]
    );

    return res.json({ success: true, message: 'Pengguna berhasil dipulihkan.' });
  } catch (error) {
    console.error('restoreUser error:', error);
    return res.status(500).json({ message: 'Gagal memulihkan pengguna.' });
  }
};
