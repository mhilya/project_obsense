const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak: khusus admin.' });
  }
  next();
};

// Tentukan user_id target.
// - akun pengguna (mobile): selalu id sendiri; menyebut user_id orang lain ditolak
// - admin (web): wajib menyebut user_id (body/query) bila `required`
const resolveUserId = (req, { required = false } = {}) => {
  const given = req.body?.user_id ?? req.query?.user_id;

  if (req.user.type === 'user') {
    if (given !== undefined && given !== '' && Number(given) !== req.user.id) {
      return { error: { status: 403, message: 'Anda hanya dapat mengakses data milik sendiri.' } };
    }
    return { userId: req.user.id };
  }

  if (given === undefined || given === '') {
    return required
      ? { error: { status: 400, message: 'user_id wajib diisi.' } }
      : { userId: null };
  }
  return { userId: Number(given) };
};

module.exports = { requireAdmin, resolveUserId };
