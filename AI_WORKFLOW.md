# AI Workflow Note

### 1. Which AI tools you used
- **Antigravity (Gemini 3.8 Flash / Claude 3.5 Sonnet)**: Used for architecture evaluation, database connection debugging, schema migration scripting, frontend design system reproduction, and automated test execution.

---

### 2. Where AI materially sped up your work
- **Connection String & Supabase Pooler Diagnostics**: Rapidly pinpointed a malformed pooler URI (missing colon between the project reference and password in Supabase's transaction pooler string) and generated resilient regex auto-repair logic to ensure the app recovers gracefully even with malformed input.
- **Migration System Design**: Generated the migration runner (`scripts/migrate.mjs`), migration tracking (`_migrations` table), and idempotent reviewer account seeding (`alice`, `bob`, `carol` with salted scrypt hashing) in minutes.
- **Pixel-Accurate UI System**: Accurately extracted typography, colors, SVG icons, and component states from reference design screenshots to build a cohesive design system in CSS and React.
- **Test Harness**: Created and validated end-to-end access control unit tests, file upload parsers (`.docx`, `.md`, `.txt`), and scrypt hashing validation.

---

### 3. What AI-generated output was changed or rejected
- **Rejected SQLite in favor of Supabase Postgres**: An initial AI scaffold suggested SQLite via `better-sqlite3`. Because Vercel and serverless functions feature an ephemeral filesystem that drops state between cold starts, SQLite was rejected in favor of hosted Supabase PostgreSQL configured with `prepare: false` and `max: 1` to stay strictly within free-tier pooler constraints.
- **Replaced naive client-side auth with server-side crypto**: Replaced JWT-in-localStorage suggestions with HTTP-only cookies and cryptographic SHA-256 session hashing against a server-side `sessions` table. This allows instant revocation on logout and eliminates XSS token-theft vectors.
- **Corrected Supabase Pooler URI parsing**: Rejected standard `new URL(str)` parsing as brittle when user-pasted connection strings omit separators, adding deterministic length-based extraction for 20-character Supabase project references.
- **Adjusted Tiptap SSR Handling**: Modified default Tiptap setup by adding `immediatelyRender: false` to avoid Next.js hydration mismatches on server/client renders.

---

### 4. How correctness, UX quality, and implementation reliability were verified
- **Automated Unit Testing (`npm test`)**: Verified access rules (`owner`, `editor`, `null`), title length validation, email validation, password hashing/verification, and Markdown/TXT/corrupted Word file conversion with 9 Vitest unit tests.
- **Production Build Verification (`npm run build`)**: Verified that Next.js App Router dynamic route handlers compile cleanly with zero type or packaging errors.
- **End-to-End Auth & Session Verification**: Tested login, session cookie issuing, and authenticated queries via programmatic fetch tests to `/api/auth/login` and `/api/auth/me`.
- **Cross-User Sharing Flow**: Tested multi-account isolation:
  1. Alice logs in and creates a document.
  2. Alice shares the document with Bob (`bob@example.com`).
  3. Bob logs in and sees the document listed under **"Shared with me"** with edit rights.
  4. Carol logs in and receives a `403 Forbidden` if attempting to access Alice's unshared document directly.
- **Persistence Verification**: Tested hard page refreshes and server restarts to confirm document content and title modifications persist intact in the Supabase PostgreSQL database.
