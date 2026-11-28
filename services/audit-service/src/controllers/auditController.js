const { pool } = require('../config/db');

const parseJson = (v) => {
  if (v === null || v === undefined) return {};
  if (typeof v === 'string') {
    try {
      return JSON.parse(v);
    } catch (e) {
      return {};
    }
  }
  return v;
};

// GET /api/audit?action=&entity_type=&limit=
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, entity_type, limit = 200 } = req.query;
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (action) {
      sql += ' AND action = ?';
      params.push(action);
    }
    if (entity_type) {
      sql += ' AND entity_type = ?';
      params.push(entity_type);
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 200, 1), 1000);
    sql += ' ORDER BY created_at DESC, id DESC LIMIT ?';
    params.push(safeLimit);

    const [rows] = await pool.query(sql, params);
    const data = rows.map((r) => ({ ...r, details: parseJson(r.details) }));
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    return res.status(500).json({ message: 'Gagal memuat audit logs.' });
  }
};

// POST /api/audit
exports.createAuditLog = async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.action || !b.entity_type) {
      return res.status(400).json({ message: 'action dan entity_type wajib diisi.' });
    }

    const adminId = b.admin_id ?? req.user?.id ?? null;
    const adminName = b.admin_name || req.user?.name || 'System';
    const adminEmail = b.admin_email || req.user?.email || null;
    const ipAddress = b.ip_address || req.ip || null;
    const userAgent = (b.user_agent || req.headers['user-agent'] || '').slice(0, 255) || null;

    const [result] = await pool.query(
      `INSERT INTO audit_logs
         (admin_id, admin_name, admin_email, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminId,
        adminName,
        adminEmail,
        String(b.action).toUpperCase(),
        String(b.entity_type),
        b.entity_id !== undefined && b.entity_id !== null ? String(b.entity_id) : null,
        JSON.stringify(b.details || {}),
        ipAddress,
        userAgent,
      ]
    );

    const [saved] = await pool.query('SELECT * FROM audit_logs WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      success: true,
      message: 'Audit log tercatat.',
      data: { ...saved[0], details: parseJson(saved[0].details) },
    });
  } catch (err) {
    console.error('createAuditLog error:', err);
    return res.status(500).json({ message: 'Gagal mencatat audit log.' });
  }
};
