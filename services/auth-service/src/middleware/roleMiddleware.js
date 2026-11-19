// Hanya akun admin dengan role super_admin yang boleh lewat
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.type !== 'admin' || req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Akses ditolak: khusus Super Administrator.' });
  }
  next();
};

module.exports = { requireSuperAdmin };
