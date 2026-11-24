const { pool } = require('../config/db');
const { resolveUserId } = require('../middleware/accessMiddleware');
const { parseJson, todayStr, diffDays, isDateStr } = require('../utils/helpers');

const WINDOW_DAYS = 14;
const CAEC = ['no', 'Sometimes', 'Frequently', 'Always'];
const MTRANS = ['Automobile', 'Motorbike', 'Bike', 'Public_Transportation', 'Walking'];

// Validasi rentang nilai kuesioner harian. Return pesan error atau null.
const validateLogFields = ({ faf, tue, fcvc, ncp = 3, ch2o, caec, calc, mtrans }) => {
  if (![0, 1, 2, 3].includes(Number(faf))) return 'faf harus 0–3.';
  if (![0, 1, 2].includes(Number(tue))) return 'tue harus 0–2.';
  if (![1, 2, 3].includes(Number(fcvc))) return 'fcvc harus 1–3.';
  if (![1, 2, 3, 4].includes(Number(ncp))) return 'ncp (jumlah makan utama) harus 1–4.';
  if (ch2o === '' || ch2o === null || Number.isNaN(Number(ch2o)) || Number(ch2o) < 0 || Number(ch2o) > 9.9) {
    return 'ch2o (liter) harus 0–9.9.';
  }
  if (!CAEC.includes(caec)) return `caec harus salah satu dari: ${CAEC.join(', ')}.`;
  if (!CAEC.includes(calc)) return `calc harus salah satu dari: ${CAEC.join(', ')}.`;
  if (!MTRANS.includes(mtrans)) return `mtrans harus salah satu dari: ${MTRANS.join(', ')}.`;
  return null;
};

const fmtCycle = (c) => ({
  ...c,
  completion_rate: Number(c.completion_rate),
  aggregated_features: parseJson(c.aggregated_features),
});

const fmtLog = (l) => ({
  ...l,
  faf: Number(l.faf),
  tue: Number(l.tue),
  fcvc: Number(l.fcvc),
  ncp: Number(l.ncp ?? 3),
  favc: Boolean(l.favc),
  ch2o: Number(l.ch2o),
  scc: Boolean(l.scc),
});

// Siklus in_progress yang melewati end_date otomatis menjadi 'expired'
const expireOld = async (userId = null) => {
  let sql = "UPDATE assessment_cycles SET status = 'expired' WHERE status = 'in_progress' AND end_date < ?";
  const params = [todayStr()];
  if (userId) {
    sql += ' AND user_id = ?';
    params.push(userId);
  }
  await pool.query(sql, params);
};

// Hitung ulang completion_rate, status, dan ringkasan fitur sebuah siklus
const refreshCycle = async (cycleId) => {
  const [logs] = await pool.query(
    'SELECT faf, tue, fcvc, ncp, favc, ch2o, caec, scc, calc, mtrans FROM daily_logs WHERE cycle_id = ? AND deleted_at IS NULL',
    [cycleId]
  );
  const n = logs.length;
  const completionRate = Number(Math.min(100, (n / WINDOW_DAYS) * 100).toFixed(1));
  const status = n >= WINDOW_DAYS ? 'completed' : 'in_progress';

  let aggregated = null;
  if (n > 0) {
    const mean = (k) => Number((logs.reduce((s, l) => s + Number(l[k]), 0) / n).toFixed(2));
    const mode = (k, numeric = false) => {
      const counts = {};
      logs.forEach((l) => {
        const val = String(l[k]);
        counts[val] = (counts[val] || 0) + 1;
      });
      const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || (numeric ? Number(b) - Number(a) : 0))[0];
      return numeric ? Number(top) : top;
    };
    aggregated = {
      logged_days: n,
      faf_mean: mean('faf'),
      tue_mean: mean('tue'),
      fcvc_mode: mode('fcvc', true),
      ncp_mean: mean('ncp'),
      favc_ratio: Number((logs.filter((l) => l.favc).length / n).toFixed(2)),
      ch2o_mean: mean('ch2o'),
      caec_mode: mode('caec'),
      scc_mode: logs.filter((l) => l.scc).length / n >= 0.5,
      calc_mode: mode('calc'),
      mtrans_mode: mode('mtrans'),
    };
  }

  await pool.query(
    'UPDATE assessment_cycles SET completion_rate = ?, status = ?, aggregated_features = ? WHERE id = ?',
    [completionRate, status, aggregated ? JSON.stringify(aggregated) : null, cycleId]
  );
  return { completionRate, status, aggregated };
};

const findCurrentCycle = async (userId) => {
  await expireOld(userId);
  const [rows] = await pool.query(
    "SELECT * FROM assessment_cycles WHERE user_id = ? AND status = 'in_progress' ORDER BY cycle_number DESC LIMIT 1",
    [userId]
  );
  return rows[0] || null;
};

// GET /api/cycles?user_id=&status=
exports.getCycles = async (req, res) => {
  try {
    const { userId, error } = resolveUserId(req);
    if (error) return res.status(error.status).json({ message: error.message });

    await expireOld(userId);
    let sql = 'SELECT * FROM assessment_cycles WHERE 1=1';
    const params = [];
    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    if (req.query.status) {
      sql += ' AND status = ?';
      params.push(req.query.status);
    }
    sql += ' ORDER BY id DESC';

    const [rows] = await pool.query(sql, params);
    const data = rows.map(fmtCycle);
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('getCycles error:', err);
    return res.status(500).json({ message: 'Gagal memuat data siklus pemantauan.' });
  }
};

// GET /api/cycles/current  -> siklus berjalan milik user (data: null bila belum ada)
exports.getCurrentCycle = async (req, res) => {
  try {
    const { userId, error } = resolveUserId(req, { required: true });
    if (error) return res.status(error.status).json({ message: error.message });

    const cycle = await findCurrentCycle(userId);
    if (!cycle) return res.json({ success: true, data: null });

    const [logs] = await pool.query(
      'SELECT * FROM daily_logs WHERE cycle_id = ? AND deleted_at IS NULL ORDER BY log_date ASC',
      [cycle.id]
    );
    return res.json({
      success: true,
      data: { ...fmtCycle(cycle), today: todayStr(), daily_logs: logs.map(fmtLog) },
    });
  } catch (err) {
    console.error('getCurrentCycle error:', err);
    return res.status(500).json({ message: 'Gagal memuat siklus berjalan.' });
  }
};

// POST /api/cycles  -> mulai siklus 14 hari baru
exports.createCycle = async (req, res) => {
  try {
    const { userId, error } = resolveUserId(req, { required: true });
    if (error) return res.status(error.status).json({ message: error.message });

    const current = await findCurrentCycle(userId);
    if (current) {
      return res.status(409).json({
        message: 'Masih ada siklus yang sedang berjalan.',
        data: fmtCycle(current),
      });
    }

    const startDate = isDateStr(req.body?.start_date) ? req.body.start_date : todayStr();
    const [num] = await pool.query(
      'SELECT COALESCE(MAX(cycle_number), 0) + 1 AS next FROM assessment_cycles WHERE user_id = ?',
      [userId]
    );
    const [result] = await pool.query(
      `INSERT INTO assessment_cycles (user_id, cycle_number, start_date, end_date)
       VALUES (?, ?, ?, DATE_ADD(?, INTERVAL ? DAY))`,
      [userId, num[0].next, startDate, startDate, WINDOW_DAYS - 1]
    );
    const [rows] = await pool.query('SELECT * FROM assessment_cycles WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Siklus baru dimulai.', data: fmtCycle(rows[0]) });
  } catch (err) {
    console.error('createCycle error:', err);
    return res.status(500).json({ message: 'Gagal membuat siklus.' });
  }
};

// GET /api/cycles/daily-logs?cycle_id=&user_id=&start_date=&end_date=
exports.getDailyLogs = async (req, res) => {
  try {
    const { userId, error } = resolveUserId(req);
    if (error) return res.status(error.status).json({ message: error.message });

    let sql = 'SELECT * FROM daily_logs WHERE deleted_at IS NULL';
    const params = [];
    if (req.query.cycle_id) {
      sql += ' AND cycle_id = ?';
      params.push(req.query.cycle_id);
    }
    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    if (req.query.start_date && req.query.end_date) {
      sql += ' AND log_date BETWEEN ? AND ?';
      params.push(req.query.start_date, req.query.end_date);
    }
    sql += ' ORDER BY log_date DESC, id DESC';

    const [rows] = await pool.query(sql, params);
    const data = rows.map(fmtLog);
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('getDailyLogs error:', err);
    return res.status(500).json({ message: 'Gagal memuat data log harian.' });
  }
};

// POST /api/cycles/daily-logs  (simpan / perbarui log pada tanggal tertentu)
exports.createDailyLog = async (req, res) => {
  try {
    const { userId, error } = resolveUserId(req, { required: true });
    if (error) return res.status(error.status).json({ message: error.message });

    const b = req.body;

    // Tentukan siklus: cycle_id eksplisit, atau siklus berjalan milik user
    let cycle;
    if (b.cycle_id) {
      await expireOld(userId);
      const [rows] = await pool.query('SELECT * FROM assessment_cycles WHERE id = ?', [b.cycle_id]);
      cycle = rows[0];
    } else {
      cycle = await findCurrentCycle(userId);
    }
    if (!cycle) {
      return res.status(404).json({ message: 'Belum ada siklus berjalan. Mulai siklus dulu (POST /api/cycles).' });
    }
    if (cycle.user_id !== userId) {
      return res.status(403).json({ message: 'Siklus tersebut bukan milik user ini.' });
    }
    if (cycle.status !== 'in_progress') {
      return res.status(400).json({ message: `Siklus berstatus ${cycle.status}, log tidak dapat diubah.` });
    }

    const logDate = b.log_date === undefined ? todayStr() : b.log_date;
    if (!isDateStr(logDate)) {
      return res.status(400).json({ message: 'log_date harus berformat YYYY-MM-DD.' });
    }
    if (logDate > todayStr()) {
      return res.status(400).json({ message: 'log_date tidak boleh di masa depan.' });
    }
    if (logDate < cycle.start_date || logDate > cycle.end_date) {
      return res.status(400).json({
        message: `log_date harus di dalam siklus (${cycle.start_date} s/d ${cycle.end_date}).`,
      });
    }
    const dayNumber = diffDays(cycle.start_date, logDate) + 1;

    // Validasi nilai kuesioner
    const faf = b.faf ?? 0;
    const tue = b.tue ?? 0;
    const fcvc = b.fcvc ?? 1;
    const ncp = b.ncp ?? 3;
    const ch2o = b.ch2o ?? 1.5;
    const caec = b.caec ?? 'Sometimes';
    const calc = b.calc ?? 'no';
    const mtrans = b.mtrans ?? 'Public_Transportation';

    const validationError = validateLogFields({ faf, tue, fcvc, ncp, ch2o, caec, calc, mtrans });
    if (validationError) return res.status(400).json({ message: validationError });

    await pool.query(
      `INSERT INTO daily_logs
         (cycle_id, user_id, log_date, day_number, faf, tue, fcvc, ncp, favc, ch2o, caec, scc, calc, mtrans, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         faf = VALUES(faf), tue = VALUES(tue), fcvc = VALUES(fcvc), ncp = VALUES(ncp), favc = VALUES(favc),
         ch2o = VALUES(ch2o), caec = VALUES(caec), scc = VALUES(scc), calc = VALUES(calc),
         mtrans = VALUES(mtrans), notes = VALUES(notes), deleted_at = NULL`,
      [
        cycle.id, userId, logDate, dayNumber,
        Number(faf), Number(tue), Number(fcvc), Number(ncp), b.favc ? 1 : 0, Number(ch2o),
        caec, b.scc ? 1 : 0, calc, mtrans, b.notes || null,
      ]
    );

    const summary = await refreshCycle(cycle.id);
    const [saved] = await pool.query(
      'SELECT * FROM daily_logs WHERE cycle_id = ? AND user_id = ? AND log_date = ?',
      [cycle.id, userId, logDate]
    );

    return res.status(201).json({
      success: true,
      message: 'Log harian berhasil disimpan.',
      data: {
        log: fmtLog(saved[0]),
        cycle: {
          id: cycle.id,
          status: summary.status,
          completion_rate: summary.completionRate,
          aggregated_features: summary.aggregated,
        },
      },
    });
  } catch (err) {
    console.error('createDailyLog error:', err);
    return res.status(500).json({ message: 'Gagal menyimpan log harian.' });
  }
};

// PUT /api/cycles/daily-logs/:id
exports.updateDailyLog = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM daily_logs WHERE id = ? AND deleted_at IS NULL', [req.params.id]);
    const log = rows[0];
    if (!log) return res.status(404).json({ message: 'Log harian tidak ditemukan.' });

    if (req.user.type === 'user' && log.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Anda hanya dapat mengakses data milik sendiri.' });
    }

    const b = req.body;
    const next = {
      faf: b.faf !== undefined ? b.faf : log.faf,
      tue: b.tue !== undefined ? b.tue : log.tue,
      fcvc: b.fcvc !== undefined ? b.fcvc : log.fcvc,
      ncp: b.ncp !== undefined ? b.ncp : (log.ncp ?? 3),
      favc: b.favc !== undefined ? (b.favc ? 1 : 0) : log.favc,
      ch2o: b.ch2o !== undefined ? b.ch2o : log.ch2o,
      caec: b.caec !== undefined ? b.caec : log.caec,
      scc: b.scc !== undefined ? (b.scc ? 1 : 0) : log.scc,
      calc: b.calc !== undefined ? b.calc : log.calc,
      mtrans: b.mtrans !== undefined ? b.mtrans : log.mtrans,
      notes: b.notes !== undefined ? (b.notes || null) : log.notes,
    };

    const validationError = validateLogFields(next);
    if (validationError) return res.status(400).json({ message: validationError });

    await pool.query(
      `UPDATE daily_logs
       SET faf = ?, tue = ?, fcvc = ?, ncp = ?, favc = ?, ch2o = ?, caec = ?, scc = ?, calc = ?, mtrans = ?, notes = ?
       WHERE id = ?`,
      [
        Number(next.faf), Number(next.tue), Number(next.fcvc), Number(next.ncp), next.favc, Number(next.ch2o),
        next.caec, next.scc, next.calc, next.mtrans, next.notes, log.id,
      ]
    );

    const summary = await refreshCycle(log.cycle_id);
    const [saved] = await pool.query('SELECT * FROM daily_logs WHERE id = ?', [log.id]);

    return res.json({
      success: true,
      message: 'Log harian berhasil diperbarui.',
      data: {
        log: fmtLog(saved[0]),
        cycle: {
          id: log.cycle_id,
          status: summary.status,
          completion_rate: summary.completionRate,
          aggregated_features: summary.aggregated,
        },
      },
    });
  } catch (err) {
    console.error('updateDailyLog error:', err);
    return res.status(500).json({ message: 'Gagal memperbarui log harian.' });
  }
};

// DELETE /api/cycles/daily-logs/:id (soft delete)
exports.deleteDailyLog = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM daily_logs WHERE id = ? AND deleted_at IS NULL', [req.params.id]);
    const log = rows[0];
    if (!log) return res.status(404).json({ message: 'Log harian tidak ditemukan.' });

    if (req.user.type === 'user' && log.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Anda hanya dapat mengakses data milik sendiri.' });
    }

    await pool.query('UPDATE daily_logs SET deleted_at = NOW() WHERE id = ?', [log.id]);
    const summary = await refreshCycle(log.cycle_id);

    return res.json({
      success: true,
      message: 'Log harian berhasil dihapus.',
      data: {
        id: log.id,
        cycle: {
          id: log.cycle_id,
          status: summary.status,
          completion_rate: summary.completionRate,
          aggregated_features: summary.aggregated,
        },
      },
    });
  } catch (err) {
    console.error('deleteDailyLog error:', err);
    return res.status(500).json({ message: 'Gagal menghapus log harian.' });
  }
};
