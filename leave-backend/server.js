const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
require('./config/db');
const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const ALLOWED_ORIGINS = [
  'https://dapper-cranachan-8ad1f4.netlify.app',
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow no-origin requests (Render health checks, curl, mobile)
    if (!origin) return callback(null, true);
    // allow any netlify.app preview/deploy URL for this site
    if (origin.endsWith('.netlify.app')) return callback(null, true);
    // allow explicitly listed origins
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // allow any origin added via env var (comma-separated)
    const extra = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
      : [];
    if (extra.includes(origin)) return callback(null, true);

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// handle preflight for every route first
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);

app.get('/', (_req, res) => {
  res.send('API running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
