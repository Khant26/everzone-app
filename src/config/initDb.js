import pool from './database.js';
import bcrypt from 'bcryptjs';
import config from './env.js';

const initializeDatabase = async () => {
  try {
    // Test database connection first
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful');

    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Categories table ready');

    // Create services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Services table ready');

    // Create projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        location VARCHAR(255),
        duration VARCHAR(100),
        area VARCHAR(100),
        description TEXT NOT NULL,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Projects table ready');

    // Create contact_forms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_forms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        message TEXT NOT NULL,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Contact forms table ready');

    // Create admins table for superadmin users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(50) DEFAULT 'superadmin',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Admins table ready');

    // Seed the first superadmin from env (ADMIN_USERNAME / ADMIN_EMAIL /
    // ADMIN_PASSWORD) when none exists. Without ADMIN_PASSWORD nothing is
    // seeded; create one with POST /api/admin/register instead.
    const adminCheck = await pool.query('SELECT COUNT(*) as count FROM admins');
    if (parseInt(adminCheck.rows[0].count, 10) === 0) {
      const { username, email, password } = config.seedAdmin;
      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query(
          'INSERT INTO admins (username, password_hash, email, role, is_active) VALUES ($1, $2, $3, $4, $5)',
          [username, passwordHash, email, 'superadmin', true]
        );
        console.log(`✓ Seeded superadmin "${username}" from ADMIN_* environment variables`);
      } else {
        console.log('⚠️  No superadmin exists. Set ADMIN_PASSWORD and restart, or POST /api/admin/register.');
      }
    } else {
      console.log('✓ Superadmin already exists');
    }

    console.log('✓ All database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('→ Connection refused: Check if database host is reachable');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('→ Connection timeout: Check your network or database credentials');
    } else if (error.code === 'ENOTFOUND') {
      console.error('→ Host not found: Verify DATABASE_URL / DB_HOST');
    }
    throw error;
  }
};

export default initializeDatabase;
