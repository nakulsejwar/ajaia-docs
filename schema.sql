-- Optional: the app creates all of this (plus 3 demo accounts) automatically on the first request.
create table if not exists users (id text primary key, name text not null, email text not null, password_hash text);
create unique index if not exists users_email_key on users (email);
create table if not exists docs (
  id text primary key, title text not null, content text not null default '',
  owner_id text not null references users(id), updated_at timestamptz not null default now());
create table if not exists shares (
  doc_id text references docs(id) on delete cascade, user_id text references users(id),
  primary key (doc_id, user_id));
create table if not exists sessions (
  token_hash text primary key, user_id text not null references users(id) on delete cascade,
  expires_at timestamptz not null);
alter table users enable row level security;
alter table docs enable row level security;
alter table shares enable row level security;
alter table sessions enable row level security;
