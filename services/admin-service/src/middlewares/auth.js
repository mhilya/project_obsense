const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Simpan user data di request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token tidak valid" });
  }
};

const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Autentikasi diperlukan" });
  }
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: "Hanya admin yang bisa mengakses" });
  }
  next();
};

const checkSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Autentikasi diperlukan" });
  }
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: "Hanya super admin yang bisa mengakses" });
  }
  next();
};

module.exports = {
  verifyToken,
  checkAdmin,
  checkSuperAdmin
};