# Ajaia Docs

A lightweight, collaborative document editor built with **Next.js 14 (App Router)**, **Tiptap**, and **Supabase PostgreSQL**, optimized for zero-config serverless deployment on Vercel.

---

## Features

- **Document Management:** Create, rename, edit, auto-save (debounced with live status feedback), and delete documents.
- **Rich-Text Editor:** Powered by Tiptap with support for bold, italic, underline, headings (H1/H2), and bulleted & numbered lists.
- **Document Import:** Import `.txt`, `.md`, and `.docx` documents (up to 4 MB) directly into new formatted documents.
- **Sharing & Access Control:**
  - Share documents with other registered users via their email.
  - Distinct dashboard views for **"Owned by me"** and **"Shared with me"**.
  - Strict server-side permission verification (owner / editor / forbidden).
- **Authentication & Sessions:**
  - Full email/password sign-up and sign-in.
  - Secure password hashing using Node.js native `crypto.scrypt` with per-user salt.
  - Server-side revocable session tokens stored as SHA-256 hashes in PostgreSQL.
- **Security & Data Isolation:** Row Level Security (RLS) enabled across all database tables to block unauthorized access via Supabase's public API.
- **Implemented Stretch Features:**
  - **Export to PDF & Markdown:** One-click instant Markdown (`.md`) download and clean, print-styled PDF export.
  - **Role-Based Permissions:** Granular sharing controls allowing owners to assign collaborators as either **"Can edit"** or **"Can view"** (with read-only enforcement and server-side 403 protection).
  - **Document Version History:** Automatic revision snapshots on save with a version history drawer and one-click restore.
  - **Real-Time Collaboration Indicators:** Live presence indicators displaying collaborator avatar bubbles and pulsating green status for active viewers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Actions/Route Handlers) |
| **Frontend** | [React 18](https://react.dev/) + CSS Modules / Vanilla CSS |
| **Editor** | [Tiptap](https://tiptap.dev/) (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`) |
| **Database** | [PostgreSQL via Supabase](https://supabase.com/) |
| **DB Client** | [postgres.js](https://github.com/porsager/postgres) |
| **Parsers** | [marked](https://github.com/markedjs/marked) (Markdown), [mammoth](https://github.com/mwilliamson/mammoth.js) (DOCX) |
| **Testing** | [Vitest](https://vitest.dev/) |

---

## Getting Started

### Prerequisites

- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **npm**, **yarn**, or **pnpm**
- A **Supabase PostgreSQL** project (free tier)

### 1. Installation

Clone or extract the repository, then install project dependencies:

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and configure your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

> **Note on Connection Ports:**
> - **Port `5432`**: Session pooler (ideal for local development).
> - **Port `6543`**: Transaction pooler (recommended on Vercel to preserve connection limits and support IPv4-only serverless environments).

### 3. Database Migration

Run the built-in migration runner to create tables, enable Row Level Security, and seed reviewer accounts:

```bash
npm run migrate
```

This runs:
- `migrations/001_initial_schema.sql`: Sets up `users`, `docs`, `shares`, `sessions`, unique indexes, and RLS.
- Demo user seeding: Automatically registers Alice, Bob, and Carol for testing.
- Tracks execution status in the `_migrations` database table.

### 4. Running the Development Server

Start the local Next.js server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Pre-seeded Reviewer Accounts

All demo accounts use the password: `Password123!`

| User | Email | Role |
|---|---|---|
| **Alice Rao** | `alice@example.com` | Demo User 1 |
| **Bob Khan** | `bob@example.com` | Demo User 2 |
| **Carol Mehta** | `carol@example.com` | Demo User 3 |

*You can also create fresh accounts anytime through the Sign Up form in the UI.*

### Sharing Flow Verification
1. Sign in as **Alice** (`alice@example.com`).
2. Click **New document**, add text, and type `bob@example.com` under **Share**.
3. Sign out and sign in as **Bob** (`bob@example.com`).
4. The document immediately appears under Bob's **"Shared with me"** dashboard with full edit permissions.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| **Development** | `npm run dev` | Starts Next.js development server at `localhost:3000` |
| **Build** | `npm run build` | Compiles and builds optimized production bundle |
| **Production Start** | `npm run start` | Runs the compiled Next.js production server |
| **Migrate** | `npm run migrate` | Applies pending database migrations and seeds demo data |
| **Test** | `npm test` | Runs unit tests via Vitest |

---

## Database Schema

```mermaid
erDiagram
    users ||--o{ docs : owns
    users ||--o{ shares : has_access
    users ||--o{ sessions : has
    docs ||--o{ shares : shared_with

    users {
        text id PK
        text name
        text email UK
        text password_hash
    }

    docs {
        text id PK
        text title
        text content
        text owner_id FK
        timestamptz updated_at
    }

    shares {
        text doc_id PK, FK
        text user_id PK, FK
    }

    sessions {
        text token_hash PK
        text user_id FK
        timestamptz expires_at
    }
```

---

## Deployment to Vercel

1. Push the code to a GitHub / GitLab repository.
2. Import the project into **[Vercel](https://vercel.com)**.
3. In **Project Settings → Environment Variables**, add:
   - `DATABASE_URL`: Your Supabase **Transaction pooler** connection string (port `6543`).
4. Deploy. Vercel will build the application using `npm run build` and launch serverless route handlers.
