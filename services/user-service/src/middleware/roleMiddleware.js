const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak: khusus admin.' });
  }
  next();
};

const requireUser = (req, res, next) => {
  if (!req.user || req.user.type !== 'user') {
    return res.status(403).json({ message: 'Akses ditolak: khusus akun pengguna (mobile).' });
  }
  next();
};

module.exports = { requireAdmin, requireUser };
