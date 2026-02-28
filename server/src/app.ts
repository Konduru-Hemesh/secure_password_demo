import express from 'express';
import cors from 'cors';
import vaultRoutes from './routes/vault';
import authRoutes from './routes/auth';
import deviceRoutes from './routes/devices';
import { generalLimiter, authLimiter } from './middleware/rateLimiter';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// US 3.10 — Rate Limiting: apply general limiter to all routes
app.use(generalLimiter);

// US 3.5 — Secure Logging: log only method + URL, never body content
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/vault', vaultRoutes);
app.use('/api/auth', authLimiter, authRoutes);  // stricter limiter on auth
app.use('/api/devices', deviceRoutes);

export default app;
