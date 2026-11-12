# Architecture note

**Stack:** Next.js route handlers (API) + React client pages, Tiptap editor, Supabase Postgres via `postgres` (postgres.js). One deployable unit on Vercel.

**Why Postgres, not SQLite:** Vercel functions have an ephemeral filesystem, so SQLite would lose data. Supabase has a free tier. The client uses `prepare:false` and `max:1` so it works with the transaction pooler and doesn't exhaust free-tier connections. RLS is enabled on all tables so Supabase's public API can't read them; the app uses a server-side connection only.

**Data model & Migrations:** `users`, `docs` (title, HTML content, owner), `shares (doc_id, user_id, role)`, `doc_versions (doc_id, title, content, created_by)`, `doc_presence (doc_id, user_id, last_seen)`, and `sessions`. Schema migrations and idempotent reviewer seeding are managed via `scripts/migrate.mjs` tracking execution state in `_migrations`. Content is stored as HTML, which preserves formatting and loads straight into Tiptap.

**Access logic:** `lib/access.js` is a pure function (owner / editor / viewer / none), unit tested. Every document route goes through `loadDoc`, which returns 404 or 403 before any read or write. Only owners can share, unshare or delete; viewers have read-only access with server-side write rejection.

**Auth:** email + password. Passwords are hashed with scrypt (per-user salt, constant-time compare) using Node's built-in crypto. Sessions are server-side: the cookie holds a random 256-bit token (httpOnly, SameSite=Lax, Secure in production) and only its SHA-256 is stored in `sessions`, so sessions expire after 7 days and can be revoked on logout. Sharing is by email, so the user list is never exposed. Known gaps: no email verification, password reset or rate limiting; the share endpoint reveals whether an email has an account.

**Upload:** `.txt`, `.md` and `.docx`, 4 MB cap (under Vercel's 4.5 MB request limit), validated server-side. Markdown via `marked`, Word via `mammoth`, plain text is escaped into paragraphs. Tiptap's schema drops unsupported markup on load, which limits stored-XSS risk from imported HTML.

**Saving:** debounced autosave (700 ms), last-write-wins. Visible Saving/Saved/Not saved status.

**Prioritized:** correct access control, persistence, usable editor, and key stretch capabilities (role-based permissions, version history, presence indicators, PDF/Markdown export). **Deprioritized:** complex real-time OT/CRDT multi-cursor sync.
