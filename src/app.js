import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/env.js';
import serviceRoutes from './routes/serviceRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import contactFormRoutes from './routes/contactFormRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import {
  generalLimiter,
  createLimiter,
  contactFormLimiter
} from './middleware/rateLimiter.js';
import {
  validateInput,
  checkMaliciousPatterns
} from './middleware/inputValidation.js';
import {
  requestLogger,
  securityHeaders,
  errorHandler,
  notFoundHandler
} from './middleware/security.js';

const app = express();

// Trust proxy - Required for rate limiting to work behind proxies (like Render)
app.set('trust proxy', 1);

// ===== Security Middleware =====

// Helmet - Sets various HTTP headers for security
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  maxAge: 86400 // 24 hours
}));

// Custom security headers
app.use(securityHeaders);

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input validation and sanitization
app.use(validateInput);
app.use(checkMaliciousPatterns);

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api/', generalLimiter);

// ===== Health Check =====
// Liveness probe: 200 JSON without touching the database.
const healthHandler = (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    message: 'Server is running',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// ===== API Routes =====
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/projects', projectRoutes);

// Apply stricter rate limiting for contact forms
app.use('/api/contact-forms', contactFormLimiter);
app.use('/api/contact-forms', contactFormRoutes);

// Admin routes (authentication required for most endpoints)
app.use('/api/admin', adminRoutes);

// ===== Error Handling =====

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
