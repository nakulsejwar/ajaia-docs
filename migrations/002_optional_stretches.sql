-- Migration 002: Optional stretch features
-- 1. Role-based sharing permissions (editor vs viewer)
alter table shares add column if not exists role text not null default 'editor';

-- 2. Document version history
create table if not exists doc_versions (
  id serial primary key,
  doc_id text not null references docs(id) on delete cascade,
  title text not null,
  content text not null default '',
  created_by text not null references users(id),
  created_at timestamptz not null default now()
);
create index if not exists doc_versions_doc_id_idx on doc_versions(doc_id, created_at desc);

-- 3. Real-time collaboration presence
create table if not exists doc_presence (
  doc_id text not null references docs(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  last_seen timestamptz not null default now(),
  primary key (doc_id, user_id)
);

-- RLS
alter table doc_versions enable row level security;
alter table doc_presence enable row level security;

