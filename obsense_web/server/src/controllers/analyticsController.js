const { pool } = require('../config/db');

// GET DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total active users
    const [userStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END) as deleted_users
      FROM users
    `);

    // 2. Active assessment cycles
    const [cycleStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_cycles,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_cycles,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_cycles,
        AVG(completion_rate) as avg_completion_rate
      FROM assessment_cycles
    `);

    // 3. Obesity class distribution from latest assessments
    const [classDistribution] = await pool.query(`
      SELECT obesity_class, COUNT(*) as count
      FROM (
        SELECT a.user_id, a.obesity_class
        FROM assessments a
        INNER JOIN (
          SELECT user_id, MAX(assessment_date) as max_date, MAX(id) as max_id
          FROM assessments
          WHERE deleted_at IS NULL
          GROUP BY user_id
        ) latest ON a.user_id = latest.user_id AND a.id = latest.max_id
      ) sub
      GROUP BY obesity_class
    `);

    // 4. Critical & High risk count
    const [riskStats] = await pool.query(`
      SELECT 
        SUM(CASE WHEN risk_level = 'Critical' THEN 1 ELSE 0 END) as critical_count,
        SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) as high_count,
        SUM(CASE WHEN risk_level = 'Moderate' THEN 1 ELSE 0 END) as moderate_count,
        SUM(CASE WHEN risk_level = 'Low' THEN 1 ELSE 0 END) as low_count
      FROM (
        SELECT a.user_id, a.risk_level
        FROM assessments a
        INNER JOIN (
          SELECT user_id, MAX(id) as max_id
          FROM assessments
          WHERE deleted_at IS NULL
          GROUP BY user_id
        ) latest ON a.user_id = latest.user_id AND a.id = latest.max_id
      ) sub
    `);

    // 5. Total evaluations
    const [evalStats] = await pool.query('SELECT COUNT(*) as total_evaluations FROM admin_evaluations');

    // 6. Recent assessments list
    const [recentAssessments] = await pool.query(`
      SELECT a.*, u.name as userName, u.gender, u.age, u.height, u.weight
      FROM assessments a
      JOIN users u ON a.user_id = u.id
      WHERE a.deleted_at IS NULL
      ORDER BY a.assessment_date DESC, a.id DESC
      LIMIT 5
    `);

    // 7. Recent activity / audit logs
    const [recentAudits] = await pool.query(`
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 6
    `);

    const summary = {
      totalUsers: userStats[0].total_users || 0,
      activeUsers: userStats[0].active_users || 0,
      inProgressCycles: cycleStats[0].in_progress_cycles || 0,
      completedCycles: cycleStats[0].completed_cycles || 0,
      avgCompletionRate: Number(Number(cycleStats[0].avg_completion_rate || 0).toFixed(1)),
      criticalRiskCount: riskStats[0].critical_count || 0,
      highRiskCount: riskStats[0].high_count || 0,
      totalEvaluations: evalStats[0].total_evaluations || 0,
      classDistribution: classDistribution.reduce((acc, curr) => {
        acc[curr.obesity_class] = curr.count;
        return acc;
      }, {}),
      riskDistribution: {
        Critical: riskStats[0].critical_count || 0,
        High: riskStats[0].high_count || 0,
        Moderate: riskStats[0].moderate_count || 0,
        Low: riskStats[0].low_count || 0,
      },
      recentAssessments: recentAssessments.map(a => ({
        ...a,
        bmi: Number(a.bmi),
        probability_scores: typeof a.probability_scores === 'string' ? JSON.parse(a.probability_scores) : a.probability_scores,
        recommendations: typeof a.recommendations === 'string' ? JSON.parse(a.recommendations) : a.recommendations
      })),
      recentAudits: recentAudits.map(r => ({
        ...r,
        details: typeof r.details === 'string' ? JSON.parse(r.details) : r.details
      }))
    };

    return res.json({ success: true, data: summary });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ message: 'Gagal memuat statistik dashboard.' });
  }
};

// GET ADVANCED ANALYTICS DATA
exports.getAnalyticsReport = async (req, res) => {
  try {
    const featureImportance = [
      { feature: 'Weight (Berat Badan)', weight: 0.32, category: 'Antropometri' },
      { feature: 'Age (Usia)', weight: 0.18, category: 'Demografi' },
      { feature: 'FAF (Aktivitas Fisik)', weight: 0.14, category: 'Gaya Hidup' },
      { feature: 'FCVC (Frekuensi Sayur)', weight: 0.12, category: 'Pola Makan' },
      { feature: 'FAVC (Makanan Tinggi Kalori)', weight: 0.09, category: 'Pola Makan' },
      { feature: 'CH2O (Konsumsi Air)', weight: 0.06, category: 'Pola Makan' },
      { feature: 'TUE (Screen Time)', weight: 0.05, category: 'Gaya Hidup' },
      { feature: 'CAEC (Camilan)', weight: 0.04, category: 'Pola Makan' }
    ];

    const correlationMatrix = [
      { feature: 'FAF (Aktivitas Fisik)', correlationWithObesity: -0.68, impact: 'Protektif Tinggi', notes: 'Makin tinggi aktivitas fisik, makin rendah risiko obesitas' },
      { feature: 'TUE (Screen Time)', correlationWithObesity: 0.54, impact: 'Faktor Risiko', notes: 'Screen time tinggi berkorelasi positif dengan obesitas tipe II & III' },
      { feature: 'FCVC (Konsumsi Sayur)', correlationWithObesity: -0.61, impact: 'Protektif Tinggi', notes: 'Konsumsi sayur tiap waktu makan menurunkan BMI' },
      { feature: 'FAVC (Makanan Tinggi Kalori)', correlationWithObesity: 0.72, impact: 'Faktor Risiko Utama', notes: 'Konsumsi junk food/gorengan rutin pendorong utama obesitas' }
    ];

    const riskTrend = [
      { period: 'Minggu 1', low: 2, moderate: 3, high: 4, critical: 1 },
      { period: 'Minggu 2', low: 3, moderate: 3, high: 3, critical: 1 },
      { period: 'Minggu 3', low: 3, moderate: 4, high: 3, critical: 1 },
      { period: 'Minggu 4', low: 4, moderate: 3, high: 2, critical: 1 },
      { period: 'Minggu 5', low: 4, moderate: 3, high: 2, critical: 1 },
      { period: 'Minggu 6', low: 5, moderate: 3, high: 2, critical: 0 }
    ];

    return res.json({
      success: true,
      data: {
        featureImportance,
        correlationMatrix,
        riskTrend
      }
    });
  } catch (error) {
    console.error('getAnalyticsReport error:', error);
    return res.status(500).json({ message: 'Gagal memuat data analitik.' });
  }
};
