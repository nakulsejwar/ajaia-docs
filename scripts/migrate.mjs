import postgres from 'postgres';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from '../lib/password.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables if not already present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!rawUrl) {
  console.error('Error: DATABASE_URL or POSTGRES_URL is not defined in environment or .env.local');
  process.exit(1);
}

const url = new URL(rawUrl);
url.searchParams.delete('supa');
url.searchParams.delete('sslmode');

// Auto-fix missing colon between postgres.<project-ref> and <password> if present
if (url.username.startsWith('postgres.') && !url.password && url.username.length > 29) {
  const projectRef = url.username.slice(9, 29);
  const password = url.username.slice(29);
  url.username = 'postgres.' + projectRef;
  url.password = password;
}

const sql = postgres(url.toString(), {
  ssl: 'require',
  prepare: false,
  max: 1,
  connect_timeout: 15,
});

async function runMigrations() {
  console.log('Connecting to database...');
  try {
    await sql`SELECT 1`;
    console.log('Connected successfully!');

    // 1. Create migrations tracking table
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // 2. Migration: 001_initial_schema
    const m1Name = '001_initial_schema';
    const [m1] = await sql`SELECT name FROM _migrations WHERE name = ${m1Name}`;
    if (!m1) {
      console.log(`Applying migration: ${m1Name}...`);
      const schemaSql = fs.readFileSync(path.join(rootDir, 'migrations', '001_initial_schema.sql'), 'utf8');
      await sql.unsafe(schemaSql);
      await sql`INSERT INTO _migrations (name) VALUES (${m1Name})`;
      console.log(`Applied migration: ${m1Name}`);
    } else {
      console.log(`Migration already applied: ${m1Name}`);
    }

    // 3. Migration: 002_seed_demo_accounts
    const m2Name = '002_seed_demo_accounts';
    const [m2] = await sql`SELECT name FROM _migrations WHERE name = ${m2Name}`;
    if (!m2) {
      console.log(`Applying migration: ${m2Name}...`);
      const demoHash = await hashPassword('Password123!');
      await sql`
        INSERT INTO users (id, name, email, password_hash) VALUES
          ('alice', 'Alice Rao', 'alice@example.com', ${demoHash}),
          ('bob', 'Bob Khan', 'bob@example.com', ${demoHash}),
          ('carol', 'Carol Mehta', 'carol@example.com', ${demoHash})
        ON CONFLICT (id) DO UPDATE SET password_hash = COALESCE(users.password_hash, EXCLUDED.password_hash);
      `;
      await sql`INSERT INTO _migrations (name) VALUES (${m2Name})`;
      console.log(`Applied migration: ${m2Name} (seeded alice, bob, carol)`);
    } else {
      console.log(`Migration already applied: ${m2Name}`);
    }

    // 4. Migration: 003_optional_stretches
    const m3Name = '003_optional_stretches';
    const [m3] = await sql`SELECT name FROM _migrations WHERE name = ${m3Name}`;
    if (!m3) {
      console.log(`Applying migration: ${m3Name}...`);
      const stretchSql = fs.readFileSync(path.join(rootDir, 'migrations', '002_optional_stretches.sql'), 'utf8');
      await sql.unsafe(stretchSql);
      await sql`INSERT INTO _migrations (name) VALUES (${m3Name})`;
      console.log(`Applied migration: ${m3Name}`);
    } else {
      console.log(`Migration already applied: ${m3Name}`);
    }

    // Verify existing tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('\nMigration complete! Current tables in database:');
    tables.forEach((t) => console.log(` - ${t.table_name}`));

    const users = await sql`SELECT id, name, email FROM users ORDER BY id;`;
    console.log('\nUsers in database:');
    users.forEach((u) => console.log(` - ${u.id}: ${u.name} (${u.email})`));

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();

