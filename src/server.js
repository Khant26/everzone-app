import config, { assertRuntimeConfig } from './config/env.js';
import initializeDatabase from './config/initDb.js';
import pool from './config/database.js';
import app from './app.js';

const startServer = async () => {
  try {
    assertRuntimeConfig();
    await initializeDatabase();
    console.log('✓ Database initialized successfully');

    const server = app.listen(config.port, config.host, () => {
      console.log(`✓ Server listening on http://${config.host}:${config.port}`);
      console.log(`✓ Environment: ${config.nodeEnv}`);
      console.log(`✓ CORS enabled for: ${config.corsOrigins.join(', ')}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down...`);
      server.close(() => {
        pool.end().finally(() => process.exit(0));
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error.message || error);
    process.exit(1);
  }
};

startServer();
