const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Tabel routing: prefix path -> service tujuan.
// Tambah baris baru di sini saat service lain sudah dibuat.
const routes = [
  { path: '/api/auth', target: process.env.AUTH_SERVICE_URL || 'http://localhost:4001' },
  { path: '/api/users', target: process.env.USER_SERVICE_URL || 'http://localhost:4002' },
  { path: '/api/cycles', target: process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:4003' },
  { path: '/api/assessments', target: process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:4003' },
  { path: '/api/evaluations', target: process.env.ADMIN_SERVICE_URL || 'http://localhost:4005' },
  { path: '/api/configurations', target: process.env.ADMIN_SERVICE_URL || 'http://localhost:4005' },
  { path: '/api/audit', target: process.env.AUDIT_SERVICE_URL || 'http://localhost:4006' },
  { path: '/api/predict', target: process.env.PREDICTION_SERVICE_URL || 'http://localhost:5001' },
];

// Catatan: jangan pakai express.json() di gateway agar body diteruskan apa adanya.
routes.forEach(({ path, target }) => {
  app.use(
    createProxyMiddleware({
      pathFilter: path,
      target,
      changeOrigin: true,
      on: {
        error: (err, req, res) => {
          res.status(502).json({ message: `Service tidak tersedia (${path}).`, detail: err.message });
        },
      },
    })
  );
});

app.get('/health', (req, res) =>
  res.json({ service: 'gateway', status: 'OK', routes: routes.map((r) => r.path) })
);

app.listen(PORT, () => console.log(`🚪 gateway running on http://localhost:${PORT}`));
