const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// STEP 1: Request OTP - Kirim OTP ke email
exports.requestOTP = async (req, res) => {
  const { email, accountType = 'user' } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email wajib diisi.' });
  }

  if (!['user', 'admin'].includes(accountType)) {
    return res.status(400).json({ message: 'Tipe akun tidak valid.' });
  }

  try {
    // Cek apakah email terdaftar
    const table = accountType === 'admin' ? 'admins' : 'users';
    const [rows] = await pool.query(`SELECT id, email FROM ${table} WHERE email = ?`, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Email tidak terdaftar dalam sistem.' });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit dari sekarang

    // Simpan OTP ke database
    await pool.query(
      'INSERT INTO password_reset_otps (email, account_type, otp_code, expires_at) VALUES (?, ?, ?, ?)',
      [email, accountType, otpCode, expiresAt]
    );

    // TODO: Kirim OTP via email (integrasi dengan email service)
    // Untuk development, kita log OTP ke console
    console.log(`========================================`);
    console.log(`🔐 OTP for ${email}: ${otpCode}`);
    console.log(`⏰ Valid until: ${expiresAt.toLocaleString('id-ID')}`);
    console.log(`========================================`);

    // CATATAN: Di production, hapus otpCode dari response!
    // Response ini hanya untuk development/testing
    return res.json({
      message: 'Kode OTP telah dikirim ke email Anda. Kode berlaku selama 10 menit.',
      // Development only - remove in production:
      devOnly_otp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
      expiresIn: '10 menit',
    });
  } catch (error) {
    console.error('requestOTP error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat mengirim OTP.' });
  }
};

// STEP 2: Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otpCode, accountType = 'user' } = req.body;

  if (!email || !otpCode) {
    return res.status(400).json({ message: 'Email dan kode OTP wajib diisi.' });
  }

  if (!['user', 'admin'].includes(accountType)) {
    return res.status(400).json({ message: 'Tipe akun tidak valid.' });
  }

  try {
    // Cari OTP yang valid (belum digunakan dan belum expired)
    const [rows] = await pool.query(
      `SELECT id, otp_code, expires_at, is_used 
       FROM password_reset_otps 
       WHERE email = ? AND account_type = ? AND otp_code = ?
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email, accountType, otpCode]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Kode OTP tidak valid.' });
    }

    const otp = rows[0];

    // Cek apakah sudah digunakan
    if (otp.is_used) {
      return res.status(400).json({ message: 'Kode OTP sudah pernah digunakan.' });
    }

    // Cek apakah expired
    const now = new Date();
    const expiresAt = new Date(otp.expires_at);
    if (now > expiresAt) {
      return res.status(400).json({ message: 'Kode OTP sudah kadaluarsa. Silakan minta kode baru.' });
    }

    // OTP valid - return token sementara untuk reset password
    // Token ini akan digunakan di step 3
    return res.json({
      message: 'Kode OTP valid.',
      verified: true,
      resetToken: Buffer.from(`${email}:${otpCode}:${accountType}`).toString('base64'),
    });
  } catch (error) {
    console.error('verifyOTP error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat verifikasi OTP.' });
  }
};

// STEP 3: Reset Password dengan OTP yang sudah diverifikasi
exports.resetPassword = async (req, res) => {
  const { email, otpCode, newPassword, accountType = 'user' } = req.body;

  if (!email || !otpCode || !newPassword) {
    return res.status(400).json({ message: 'Email, kode OTP, dan password baru wajib diisi.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });
  }

  if (!['user', 'admin'].includes(accountType)) {
    return res.status(400).json({ message: 'Tipe akun tidak valid.' });
  }

  try {
    // Verifikasi OTP sekali lagi
    const [otpRows] = await pool.query(
      `SELECT id, expires_at, is_used 
       FROM password_reset_otps 
       WHERE email = ? AND account_type = ? AND otp_code = ?
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email, accountType, otpCode]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ message: 'Kode OTP tidak valid.' });
    }

    const otp = otpRows[0];

    if (otp.is_used) {
      return res.status(400).json({ message: 'Kode OTP sudah pernah digunakan.' });
    }

    const now = new Date();
    const expiresAt = new Date(otp.expires_at);
    if (now > expiresAt) {
      return res.status(400).json({ message: 'Kode OTP sudah kadaluarsa.' });
    }

    // Cek apakah email ada di database
    const table = accountType === 'admin' ? 'admins' : 'users';
    const [userRows] = await pool.query(`SELECT id FROM ${table} WHERE email = ?`, [email]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Akun tidak ditemukan.' });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(`UPDATE ${table} SET password = ? WHERE email = ?`, [hashedPassword, email]);

    // Tandai OTP sudah digunakan
    await pool.query('UPDATE password_reset_otps SET is_used = TRUE WHERE id = ?', [otp.id]);

    return res.json({
      message: 'Password berhasil diubah. Silakan login dengan password baru Anda.',
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat reset password.' });
  }
};

// Cleanup expired OTPs (optional - bisa dijadwalkan dengan cron job)
exports.cleanupExpiredOTPs = async () => {
  try {
    const [result] = await pool.query(
      'DELETE FROM password_reset_otps WHERE expires_at < NOW() OR is_used = TRUE'
    );
    console.log(`🧹 Cleaned up ${result.affectedRows} expired/used OTPs`);
  } catch (error) {
    console.error('cleanupExpiredOTPs error:', error);
  }
};
