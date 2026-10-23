import dotenv from 'dotenv';

// Load .env once, before anything reads process.env.
dotenv.config();

const toBool = (value, fallback = false) => {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

const config = {
  nodeEnv,
  isProduction,
  port: Number.parseInt(process.env.PORT, 10) || 5000,
  host: process.env.HOST || '0.0.0.0',

  // Prefer a single DATABASE_URL; fall back to discrete DB_* settings.
  databaseUrl: process.env.DATABASE_URL || '',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'everzone_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  // Hosted Postgres (Render, Neon, Supabase...) usually needs SSL.
  dbSsl: toBool(process.env.DB_SSL, false),
  // Keep the pool small: the API shares a small VM and Postgres with other apps.
  dbPoolMax: Number.parseInt(process.env.DB_POOL_MAX, 10) || 5,

  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  corsOrigins: parseOrigins(process.env.CORS_ORIGIN).length
    ? parseOrigins(process.env.CORS_ORIGIN)
    : ['http://localhost:5173', 'http://localhost:3000'],

  // Optional storefront chatbot (server-side proxy; the key never reaches the browser).
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
  },

  // SEED_DEMO=1 fills empty content tables with fictional demo data on startup.
  seedDemo: toBool(process.env.SEED_DEMO, false),

  // Optional first-run superadmin seed (only used when the admins table is empty).
  seedAdmin: {
    username: process.env.ADMIN_USERNAME || 'superadmin',
    email: process.env.ADMIN_EMAIL || 'admin@everzone.local',
    password: process.env.ADMIN_PASSWORD || '',
  },
};

/** Throws when configuration required to serve requests is missing. */
export const assertRuntimeConfig = () => {
  const problems = [];
  if (!config.jwtSecret) problems.push('JWT_SECRET is not set');
  else if (config.isProduction && config.jwtSecret.length < 32) {
    problems.push('JWT_SECRET must be at least 32 characters in production');
  }
  if (config.isProduction && !config.databaseUrl && !process.env.DB_HOST) {
    problems.push('DATABASE_URL (or DB_HOST/DB_*) is not set');
  }
  if (config.isProduction && !process.env.CORS_ORIGIN) {
    problems.push('CORS_ORIGIN is not set (e.g. https://everzone.khantmaung.com)');
  }
  if (config.seedAdmin.password && config.seedAdmin.password.length < 8) {
    problems.push('ADMIN_PASSWORD must be at least 8 characters');
  }
  if (problems.length) {
    throw new Error(`Invalid configuration:\n  - ${problems.join('\n  - ')}`);
  }
};

export default config;
