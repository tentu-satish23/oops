import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes     from './routes/auth.js';
import problemsRoutes from './routes/problems.js';
import executeRoutes  from './routes/execute.js';
import coursesRoutes  from './routes/courses.js';
import paymentsRoutes from './routes/payments.js';
import contestsRoutes from './routes/contests.js';
import profileRoutes  from './routes/profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Load .env from the server directory (works regardless of CWD)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const clientDist = path.resolve(__dirname, '../../client/dist');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-razorpay-signature']
}));

// ── Razorpay Webhook: MUST come before express.json() to receive raw body ─────
app.post('/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // Delegate to the payments router's webhook handler
    req.url = '/webhook';
    paymentsRoutes(req, res, next);
  }
);

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'ONLINE',
    platform:  "OOP'S ORACLE",
    tagline:   'Master Java. Master Logic. Build Your Future.',
    razorpay:  process.env.RAZORPAY_KEY_ID || 'simulation',
    version:   '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/execute',  executeRoutes);
app.use('/api/courses',  coursesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/contests', contestsRoutes);
app.use('/api/profile',  profileRoutes);

// ── Static Files (Production Build) ──────────────────────────────────────────
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`☕  OOP'S ORACLE Server running on http://localhost:${PORT}`);
  console.log(`📡  API Health: http://localhost:${PORT}/api/health`);
  console.log(`💳  Razorpay: ${process.env.RAZORPAY_KEY_ID || 'simulation mode'}`);
  console.log(`🎯  Master Java. Master Logic. Build Your Future.`);
  console.log(`======================================================\n`);
});
