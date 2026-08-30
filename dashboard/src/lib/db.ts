import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgres://agentic:agentic@localhost:5432/agentic_checkout?sslmode=disable';

    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}
