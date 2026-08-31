import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const rawConnectionString =
      process.env.DATABASE_URL ||
      'postgres://agentic:agentic@127.0.0.1:5432/agentic_checkout?sslmode=disable';

    const connectionString = rawConnectionString.replace('localhost', '127.0.0.1');

    pool = new Pool({
      connectionString,
      max: 10,
      connectionTimeoutMillis: 2000,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}
