const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak: Token autentikasi tidak ditemukan.' });
  }
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'obsense_secret');
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ message: 'Akses ditolak: khusus admin.' });
  }
  next();
};

module.exports = { authMiddleware, requireAdmin };
