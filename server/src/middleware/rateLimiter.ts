import rateLimit from 'express-rate-limit';

/**
 * US 3.10 — Rate Limiting Middleware
 * Protects all API endpoints from abuse and brute-force attacks.
 */

/** General API rate limit — 100 requests per 15 minutes per IP */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});

/** Strict auth rate limit — 10 attempts per 15 minutes per IP (brute-force protection) */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again later.' },
    skipSuccessfulRequests: true,
});
