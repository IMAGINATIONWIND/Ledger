import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_8hYOwIvgV0En@ep-empty-rain-b8ywwzgc-pooler.c-14.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Global singleton pool for Next.js (avoids connection exhaustion during hot reload)
declare global {
  var _neonPool: Pool | undefined;
}

export const pool: Pool =
  global._neonPool ||
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== 'production') {
  global._neonPool = pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows;
}
