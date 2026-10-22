// Creates the tables (and optional seed superadmin) without starting the server.
import initializeDatabase from '../src/config/initDb.js';
import pool from '../src/config/database.js';

try {
  await initializeDatabase();
  console.log('✓ Database setup complete');
} catch {
  process.exitCode = 1;
} finally {
  await pool.end();
}
