const { pool } = require('../config/db');

// GET ALL SYSTEM CONFIGURATIONS
exports.getConfigurations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sc.*, a.name as modified_by_name 
       FROM system_configurations sc 
       LEFT JOIN admins a ON sc.last_modified_by = a.id`
    );

    const configMap = {};
    let latestModifiedBy = 'Super Administrator';
    let latestModifiedAt = null;

    rows.forEach(r => {
      configMap[r.config_key] = typeof r.config_value === 'string' ? JSON.parse(r.config_value) : r.config_value;
      if (r.modified_by_name) latestModifiedBy = r.modified_by_name;
      if (!latestModifiedAt || new Date(r.updated_at) > new Date(latestModifiedAt)) {
        latestModifiedAt = r.updated_at;
      }
    });

    configMap.audit_info = {
      last_modified_by: latestModifiedBy,
      last_modified_at: latestModifiedAt ? new Date(latestModifiedAt).toISOString().slice(0, 19).replace('T', ' ') : '2026-09-12 16:30:00'
    };

    return res.json({ success: true, data: configMap });
  } catch (error) {
    console.error('getConfigurations error:', error);
    return res.status(500).json({ message: 'Gagal memuat konfigurasi sistem.' });
  }
};

// UPDATE SYSTEM CONFIGURATION
exports.updateConfiguration = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const adminId = req.user?.id || 1;

    if (!value) {
      return res.status(400).json({ message: 'Nilai konfigurasi (value) wajib diisi.' });
    }

    const [existing] = await pool.query('SELECT * FROM system_configurations WHERE config_key = ?', [key]);
    const beforeValue = existing.length > 0 ? existing[0].config_value : null;

    await pool.query(
      `INSERT INTO system_configurations (config_key, config_value, last_modified_by)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         config_value = VALUES(config_value),
         last_modified_by = VALUES(last_modified_by),
         updated_at = CURRENT_TIMESTAMP`,
      [key, JSON.stringify(value), adminId]
    );

    // Audit log
    const adminUser = req.user || { id: adminId, name: 'Admin', email: 'admin@obsense.com' };
    await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_name, admin_email, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, 'UPDATE_CONFIG', 'Config', ?, ?)`,
      [
        adminUser.id, adminUser.name, adminUser.email, key,
        JSON.stringify({
          before: typeof beforeValue === 'string' ? JSON.parse(beforeValue) : beforeValue,
          after: value
        })
      ]
    );

    return res.json({ success: true, message: `Konfigurasi '${key}' berhasil diperbarui.` });
  } catch (error) {
    console.error('updateConfiguration error:', error);
    return res.status(500).json({ message: 'Gagal memperbarui konfigurasi sistem.' });
  }
};
