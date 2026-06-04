import { Pool } from "pg";

export const neonPool = new Pool({
    connectionString: process.env.NEON_DB_URL,
});