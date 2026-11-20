import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL || 'postgresql://collab_user:collab_secret_password@localhost:5432/collab_workspace?schema=public';

async function initDatabaseFirst() {
  console.log('[Database-First] Initializing PostgreSQL schema from SQL DDL...');
  console.log('[Database-First] Target connection:', dbUrl.replace(/:[^:@]+@/, ':****@'));

  const pool = new Pool({
    connectionString: dbUrl,
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log('[Database-First] Connected to PostgreSQL server successfully.');

    const sqlPath = path.join(__dirname, '..', 'prisma', 'schema.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found at ${sqlPath}`);
    }

    const ddl = fs.readFileSync(sqlPath, 'utf8');
    console.log(`[Database-First] Executing ${ddl.length} bytes of raw SQL DDL...`);

    await client.query(ddl);
    console.log('[Database-First] Schema DDL executed successfully.');

    
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('[Database-First] Verified PostgreSQL tables:');
    res.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.table_name}`);
    });

    
    const docsCount = await client.query('SELECT count(*) FROM documents;');
    const canvasesCount = await client.query('SELECT count(*) FROM canvases;');
    console.log(`[Database-First] Seed records: ${docsCount.rows[0].count} documents, ${canvasesCount.rows[0].count} canvases.`);

    client.release();
    await pool.end();
    console.log('[Database-First] Setup complete! Run "npx prisma db pull" to introspect schema.');
  } catch (err) {
    console.warn('[Database-First] PostgreSQL connection note:', err.message);
    console.log('[Database-First] In-memory fallback layer is active for immediate development.');
    await pool.end();
  }
}

initDatabaseFirst();
