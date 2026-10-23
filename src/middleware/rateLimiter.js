import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

// General rate limiter - 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints - 5 requests per 15 minutes
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  skipSuccessfulRequests: true,
});

// Create limiter - 20 requests per 15 minutes
export const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many items created, please try again later.' },
  skipSuccessfulRequests: false,
});

// Contact form limiter - 10 submissions per hour
export const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many contact form submissions, please try again later.' },
  skipSuccessfulRequests: true,
});

// Sanitize data against NoSQL injection
export const sanitizeData = mongoSanitize({
  onSanitize: ({ req, key }) => {
    console.warn(`Potential injection attempt detected in ${key}`);
  }
});
