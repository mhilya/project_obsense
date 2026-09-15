const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Akses ditolak: Token autentikasi tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'obsense_secret');
    req.user = decoded; // { id, email, role, ... }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid atau telah kedaluwarsa.' });
  }
};

module.exports = authMiddleware;
