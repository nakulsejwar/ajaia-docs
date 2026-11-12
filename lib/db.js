import postgres from 'postgres';
import { hashPassword } from './password';

let sql;
let ready;

function connect() {
  const raw = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!raw) throw new Error('DATABASE_URL is not set');
  // Vercel's Supabase integration appends a non-standard `supa` param; drop it.
  const url = new URL(raw);
  url.searchParams.delete('supa');
  url.searchParams.delete('sslmode');
  // Auto-fix missing colon between postgres.<project-ref> and <password> if present in pooler URL
  if (url.username.startsWith('postgres.') && !url.password && url.username.length > 29) {
    const projectRef = url.username.slice(9, 29);
    const password = url.username.slice(29);
    url.username = 'postgres.' + projectRef;
    url.password = password;
  }
  return postgres(url.toString(), {
    ssl: 'require',      // Supabase requires TLS
    prepare: false,      // required for the transaction pooler (port 6543); harmless elsewhere
    max: 1,              // one connection per serverless instance keeps the free tier's limits safe
    idle_timeout: 20,
    connect_timeout: 15,
  });
}

async function init() {
  sql = connect();
  await sql`create table if not exists users (id text primary key, name text not null, email text not null)`;
  await sql`create table if not exists docs (
    id text primary key, title text not null, content text not null default '',
    owner_id text not null references users(id), updated_at timestamptz not null default now())`;
  await sql`create table if not exists shares (
    doc_id text references docs(id) on delete cascade, user_id text references users(id),
    primary key (doc_id, user_id))`;
  // Block Supabase's public REST/anon API; this app only reads via the server-side DB connection.
  await sql`alter table users enable row level security`;
  await sql`alter table docs enable row level security`;
  await sql`alter table shares enable row level security`;
  await sql`alter table users add column if not exists password_hash text`;
  await sql`create unique index if not exists users_email_key on users (email)`;
  await sql`create table if not exists sessions (
    token_hash text primary key, user_id text not null references users(id) on delete cascade,
    expires_at timestamptz not null)`;
  await sql`alter table sessions enable row level security`;
  // Demo accounts for reviewers (password: Password123!). Real users can sign up from the UI.
  const demo = await hashPassword('Password123!');
  await sql`insert into users (id, name, email, password_hash) values
    ('alice','Alice Rao','alice@example.com',${demo}),('bob','Bob Khan','bob@example.com',${demo}),
    ('carol','Carol Mehta','carol@example.com',${demo})
    on conflict (id) do update set password_hash = coalesce(users.password_hash, excluded.password_hash)`;
}

// Tagged-template query helper; creates schema + seeds users on first call per cold start.
export async function q(strings, ...vals) {
  ready ||= init().catch((e) => { ready = null; throw e; });
  await ready;
  return sql(strings, ...vals);
}
