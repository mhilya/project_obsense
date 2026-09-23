const { pool } = require('../config/db');

// GET AUDIT LOGS
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, entity_type, limit = 100 } = req.query;
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }
    if (entity_type) {
      query += ' AND entity_type = ?';
      params.push(entity_type);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit));

    const [rows] = await pool.query(query, params);
    const formatted = rows.map(r => ({
      ...r,
      details: typeof r.details === 'string' ? JSON.parse(r.details) : r.details
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('getAuditLogs error:', error);
    return res.status(500).json({ message: 'Gagal memuat log audit aktivitas.' });
  }
};

// CREATE MANUAL AUDIT LOG (e.g. Data Export / UI events)
exports.createAuditLog = async (req, res) => {
  try {
    const { action, entity_type, entity_id, details } = req.body;
    const adminUser = req.user || { id: null, name: 'Admin', email: 'admin@obsense.com' };
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const [result] = await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_name, admin_email, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminUser.id, adminUser.name, adminUser.email,
        action, entity_type, entity_id ? String(entity_id) : null,
        JSON.stringify(details || {}), clientIp, userAgent
      ]
    );

    return res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('createAuditLog error:', error);
    return res.status(500).json({ message: 'Gagal mencatat audit log.' });
  }
};
