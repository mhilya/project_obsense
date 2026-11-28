const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak: Token autentikasi tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'obsense_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
  }
};

const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Autentikasi diperlukan.' });
  }
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Akses ditolak: khusus admin.' });
  }
  next();
};

const checkSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Autentikasi diperlukan.' });
  }
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Akses ditolak: khusus Super Administrator.' });
  }
  next();
};

module.exports = { verifyToken, checkAdmin, checkSuperAdmin };
