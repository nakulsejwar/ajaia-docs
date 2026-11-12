# Submission Overview

### Deliverables Included
- **Source Code**: Full-stack Next.js 14 App Router project with Tiptap editor and Supabase PostgreSQL.
- **[README.md](file:///README.md)**: Local setup, database migration, environment variables, test accounts, and Vercel deployment instructions.
- **[ARCHITECTURE.md](file:///ARCHITECTURE.md)**: Architecture notes explaining stack choices, tradeoffs, access control, and prioritization.
- **[AI_WORKFLOW.md](file:///AI_WORKFLOW.md)**: Practical AI usage details covering tools, acceleration points, rejected approaches, and validation methods.
- **[screenshots/ui_overview.jpg](file:///screenshots/ui_overview.jpg)**: Visual overview of Auth, Dashboard, and Editor UI.
- **[video.txt](file:///video.txt)**: Walkthrough video link placeholder.
- **Live URL**: [https://ajaia-docs-ten-theta.vercel.app](https://ajaia-docs-ten-theta.vercel.app/)

---

### Test Accounts (Reviewer Credentials)
Password for all demo accounts: `Password123!`

- **Alice Rao**: `alice@example.com` (Owner demo)
- **Bob Khan**: `bob@example.com` (Shared collaborator demo)
- **Carol Mehta**: `carol@example.com` (Unshared third-party user)

*(Real user registration is also fully functional via the Sign Up form)*

---

### What is Working End-to-End
1. **Document Lifecycle**: Create, view, edit, inline rename, delete (owner only), and auto-save (debounced with live status).
2. **Rich Text Formatting**: Bold, italic, underline, Heading 1, Heading 2, bulleted lists, and numbered lists.
3. **File Import**: Drag/select upload of `.txt`, `.md`, and `.docx` files (up to 4 MB) transformed into editable documents.
4. **Document Export (Stretch Feature)**: One-click Markdown (`.md`) export and print-optimized PDF (`.pdf`) export directly from the editor.
5. **Role-Based Sharing Permissions (Stretch Feature)**: Granular access control when sharing — owner can grant **"Can edit"** or **"Can view"**. Viewers get view-only badges, locked editors, and server-side 403 enforcement against edits.
6. **Document Version History (Stretch Feature)**: Revisions are automatically snapshotted on save, with a **History** slide-out to inspect and restore prior versions.
7. **Real-Time Collaboration Indicators (Stretch Feature)**: Active collaborator presence indicators with avatar initials and a pulsating green dot showing who is currently viewing the document.
8. **Access Control & Sharing**: Share by recipient email, distinct **"Owned by me"** and **"Shared with me"** dashboard views, and strict server-side authorization.
9. **Authentication & Persistence**: Scrypt password hashing, revocable SHA-256 session tokens in HTTP-only cookies, and persistent PostgreSQL storage with Row-Level Security (RLS).
10. **Automated Testing**: 10 unit tests passing via Vitest covering roles (owner, editor, viewer), validation, file parsers, and password hashing.

---

### What Was Intentionally Deprioritized (Tradeoffs)
- **Real-time multi-cursor OT/CRDT typing**: Timeboxed to prioritize reliable single-source-of-truth persistence, access control, and usability over complex distributed syncing conflicts.
- **Password recovery & email verification**: Omitted external SMTP dependencies so reviewers can test zero-friction sign-ups and logins immediately.

---

### What to Build Next (With 2–4 More Hours)
1. **Document Comments & Suggestions**: Inline annotation / thread comment mode.
2. **Rate Limiting**: IP and account-based rate limiting on `/api/auth/login` and `/api/upload` via Redis/Upstash.
3. **Folder Organization**: Organize documents into workspace folders.
