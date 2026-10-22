import pkg from 'pg';
import config from './env.js';

const { Pool } = pkg;

const connection = config.databaseUrl
  ? { connectionString: config.databaseUrl }
  : {
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user: config.db.user,
      password: config.db.password,
    };

// pg creates connections lazily, so importing this module never touches the DB.
const pool = new Pool({
  ...connection,
  ssl: config.dbSsl ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
  application_name: 'everzone_backend',
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err.message);
});

export default pool;
