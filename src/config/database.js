import pkg from 'pg';
import config from './env.js';

const { Pool, types } = pkg;

// Columns are TIMESTAMP (without time zone) and the session runs in UTC, so
// read them as UTC instead of the Node host's local time zone.
types.setTypeParser(1114, (value) => new Date(`${value.replace(' ', 'T')}Z`));

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
  max: config.dbPoolMax,
  application_name: 'everzone_backend',
  options: '-c timezone=UTC',
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err.message);
});

export default pool;
