const { pool } = require('../config/db');

// GET ALL CYCLES (Optionally filter by user_id or status)
exports.getCycles = async (req, res) => {
  try {
    const { user_id, status } = req.query;
    let query = `
      SELECT ac.*, u.name as userName, u.email as userEmail
      FROM assessment_cycles ac
      JOIN users u ON ac.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ' AND ac.user_id = ?';
      params.push(user_id);
    }
    if (status) {
      query += ' AND ac.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ac.id DESC';

    const [rows] = await pool.query(query, params);
    const formatted = rows.map(c => ({
      ...c,
      completion_rate: Number(c.completion_rate),
      aggregated_features: typeof c.aggregated_features === 'string' ? JSON.parse(c.aggregated_features) : c.aggregated_features
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('getCycles error:', error);
    return res.status(500).json({ message: 'Gagal memuat data siklus pemantauan.' });
  }
};

// GET DAILY LOGS (Optionally filter by cycle_id or user_id)
exports.getDailyLogs = async (req, res) => {
  try {
    const { cycle_id, user_id, start_date, end_date } = req.query;
    let query = `
      SELECT dl.*, u.name as userName 
      FROM daily_logs dl
      JOIN users u ON dl.user_id = u.id
      WHERE dl.deleted_at IS NULL
    `;
    const params = [];

    if (cycle_id) {
      query += ' AND dl.cycle_id = ?';
      params.push(cycle_id);
    }
    if (user_id) {
      query += ' AND dl.user_id = ?';
      params.push(user_id);
    }
    if (start_date && end_date) {
      query += ' AND dl.log_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    query += ' ORDER BY dl.log_date DESC, dl.id DESC';

    const [rows] = await pool.query(query, params);
    const formatted = rows.map(l => ({
      ...l,
      faf: Number(l.faf),
      tue: Number(l.tue),
      fcvc: Number(l.fcvc),
      favc: Boolean(l.favc),
      ch2o: Number(l.ch2o),
      scc: Boolean(l.scc)
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('getDailyLogs error:', error);
    return res.status(500).json({ message: 'Gagal memuat data log harian.' });
  }
};

// CREATE DAILY LOG
exports.createDailyLog = async (req, res) => {
  try {
    const {
      cycle_id, user_id, log_date, day_number,
      faf, tue, fcvc, favc, ch2o, caec, scc, calc, mtrans, notes
    } = req.body;

    if (!cycle_id || !user_id || !log_date || day_number === undefined) {
      return res.status(400).json({ message: 'cycle_id, user_id, log_date, dan day_number wajib diisi.' });
    }

    const [result] = await pool.query(
      `INSERT INTO daily_logs 
       (cycle_id, user_id, log_date, day_number, faf, tue, fcvc, favc, ch2o, caec, scc, calc, mtrans, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         faf = VALUES(faf), tue = VALUES(tue), fcvc = VALUES(fcvc), favc = VALUES(favc),
         ch2o = VALUES(ch2o), caec = VALUES(caec), scc = VALUES(scc), calc = VALUES(calc),
         mtrans = VALUES(mtrans), notes = VALUES(notes), updated_at = CURRENT_TIMESTAMP`,
      [
        cycle_id, user_id, log_date, day_number,
        faf || 0, tue || 0, fcvc || 1, favc ? 1 : 0, ch2o || 1.5,
        caec || 'Sometimes', scc ? 1 : 0, calc || 'no', mtrans || 'Public_Transportation',
        notes || null
      ]
    );

    // Update cycle completion rate
    const [countRow] = await pool.query(
      'SELECT COUNT(*) as logged_days FROM daily_logs WHERE cycle_id = ? AND deleted_at IS NULL',
      [cycle_id]
    );
    const loggedDays = countRow[0].logged_days;
    const completionRate = Number(Math.min(100, (loggedDays / 14) * 100).toFixed(1));
    const status = loggedDays >= 14 ? 'completed' : 'in_progress';

    await pool.query(
      'UPDATE assessment_cycles SET completion_rate = ?, status = ? WHERE id = ?',
      [completionRate, status, cycle_id]
    );

    return res.status(201).json({
      success: true,
      message: 'Log harian berhasil disimpan.',
      data: { id: result.insertId || result.id, cycle_id, user_id, log_date, day_number }
    });
  } catch (error) {
    console.error('createDailyLog error:', error);
    return res.status(500).json({ message: 'Gagal menyimpan log harian.' });
  }
};
