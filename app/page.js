'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const fmt = (d) => {
  try {
    return new Date(d).toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return new Date(d).toLocaleString();
  }
};

// SVG Icons
function LogoIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="docGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="foldGrad" x1="26" y1="6" x2="34" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <rect x="8" y="6" width="24" height="30" rx="4" fill="url(#docGrad)" />
      <path d="M24 6v6a2 2 0 0 0 2 2h6L24 6z" fill="url(#foldGrad)" />
      <line x1="13" y1="18" x2="22" y2="18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="13" y1="23" x2="27" y2="23" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <line x1="13" y1="28" x2="25" y2="28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5"/>
      <path d="M20 21a8 8 0 0 0-16 0"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      <path d="m15 5 4 4"/>
    </svg>
  );
}

function EmptyDocsIllustration() {
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="10" width="28" height="38" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.8" />
      <line x1="23" y1="18" x2="35" y2="18" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
      <line x1="23" y1="24" x2="38" y2="24" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
      <line x1="23" y1="30" x2="33" y2="30" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />

      <rect x="24" y="16" width="30" height="40" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.8" />
      <line x1="30" y1="24" x2="44" y2="24" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="30" x2="48" y2="30" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="36" x2="42" y2="36" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="42" x2="38" y2="42" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

      <circle cx="45" cy="43" r="9" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
      <line x1="51.5" y1="49.5" x2="58" y2="56" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [me, setMe] = useState(undefined);
  const [docs, setDocs] = useState({ owned: [], shared: [] });
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  async function api(url, opts) {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed.');
    return data;
  }

  async function load() {
    try {
      const u = await api('/api/auth/me');
      setMe(u.me);
      if (u.me) setDocs(await api('/api/docs'));
    } catch (e) {
      setError(e.message);
      setMe(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const run = (fn) => async (...a) => {
    setError('');
    try {
      await fn(...a);
    } catch (e) {
      setError(e.message);
    }
  };

  const submitAuth = run(async (e) => {
    e.preventDefault();
    await api(`/api/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) });
    setForm({ name: '', email: '', password: '' });
    setMe(undefined);
    await load();
  });

  const signOut = run(async () => {
    await api('/api/auth/logout', { method: 'POST' });
    setMe(null);
    setDocs({ owned: [], shared: [] });
  });

  const create = run(async () => {
    const { id } = await api('/api/docs', { method: 'POST' });
    router.push(`/doc/${id}`);
  });

  const upload = run(async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const body = new FormData();
    body.append('file', f);
    const res = await fetch('/api/upload', { method: 'POST', body });
    const data = await res.json().catch(() => ({}));
    e.target.value = '';
    if (!res.ok) throw new Error(data.error || 'Upload failed.');
    router.push(`/doc/${data.id}`);
  });

  async function promptRename(e, d) {
    e.preventDefault();
    e.stopPropagation();
    const next = window.prompt('Rename document:', d.title);
    if (!next || next.trim() === d.title) return;
    try {
      await api(`/api/docs/${d.id}`, { method: 'PATCH', body: JSON.stringify({ title: next.trim() }) });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (me === undefined) {
    return (
      <div className="auth-viewport">
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  // ==========================================
  // SIGN IN / SIGN UP SCREEN
  // ==========================================
  if (!me) {
    return (
      <div className="auth-viewport">
        <div className="auth-header">
          <LogoIcon />
          <h1 className="auth-brand-title">Ajaia Docs</h1>
        </div>

        <div className="auth-card">
          <h2 className="auth-card-title">
            {mode === 'login' ? 'Sign In to Your Account' : 'Create Your Account'}
          </h2>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={submitAuth}>
            {mode === 'signup' && (
              <div className="field-group">
                <label className="field-label">Name</label>
                <div className="input-with-icon">
                  <span className="input-icon"><UserIcon /></span>
                  <input
                    required
                    className="input-field"
                    placeholder="Your Name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="field-group">
              <label className="field-label">Email</label>
              <div className="input-with-icon">
                <span className="input-icon"><MailIcon /></span>
                <input
                  required
                  type="email"
                  className="input-field"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="input-with-icon">
                <span className="input-icon"><LockIcon /></span>
                <input
                  required
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <div className="auth-actions-row">
              <button className="btn-primary" type="submit">
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
              <div className="auth-toggle-link">
                {mode === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <strong onClick={() => { setMode('signup'); setError(''); }}>Sign up</strong>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <strong onClick={() => { setMode('login'); setError(''); }}>Sign in</strong>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="auth-demo-note">
          Reviewer demo accounts (password Password123!):<br />
          alice@example.com, bob@example.com,<br />
          carol@example.com
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD SCREEN
  // ==========================================
  const userInitials = me.name
    ? me.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="dashboard-viewport">
      <div className="dashboard-container">
        {/* Navigation Bar */}
        <div className="dashboard-navbar">
          <div className="navbar-brand">Ajaia Docs</div>
          <div className="navbar-user-section">
            <span className="navbar-user-info">
              {me.name} ({me.email})
            </span>
            <div className="user-avatar-circle" title={me.name}>
              {userInitials}
            </div>
            <button className="btn-signout" onClick={signOut} title="Sign out" aria-label="Sign out">
              <LogoutIcon />
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {error && <div className="auth-error">{error}</div>}

          {/* Action Row */}
          <div className="actions-bar">
            <button className="btn-new-doc" onClick={create}>
              <PlusIcon />
              New Document
            </button>

            <div className="import-wrapper">
              <span className="import-label">Import file</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.docx"
                onChange={upload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn-choose-file"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileIcon />
                Choose File
              </button>
              <span className="import-support-note">
                Supports .txt, .md, .docx, up to 4 MB.
              </span>
            </div>
          </div>

          {/* Owned By Me Section */}
          <div className="section-header-row">
            <h3 className="section-title">Owned by me</h3>
            {docs.owned.length > 0 && (
              <div className="section-col-headers">
                <span>View</span>
                <span>Share</span>
                <span>Rename</span>
              </div>
            )}
          </div>

          <div className="doc-list">
            {docs.owned.length === 0 ? (
              <div className="empty-state-box">
                <span className="empty-state-text">No documents yet. Create one or import a file.</span>
              </div>
            ) : (
              docs.owned.map((d) => (
                <div key={d.id} className="doc-item-row">
                  <div className="doc-item-left">
                    <Link href={`/doc/${d.id}`} className="doc-item-title">
                      {d.title}
                    </Link>
                    <span className="badge-owner">Owner</span>
                  </div>

                  <div className="doc-item-right">
                    <div className="doc-action-icons">
                      <button
                        className="action-icon-btn"
                        title="View document"
                        onClick={() => router.push(`/doc/${d.id}`)}
                      >
                        <EyeIcon />
                      </button>
                      <button
                        className="action-icon-btn"
                        title="Share document"
                        onClick={() => router.push(`/doc/${d.id}`)}
                      >
                        <ShareIcon />
                      </button>
                      <button
                        className="action-icon-btn"
                        title="Rename document"
                        onClick={(e) => promptRename(e, d)}
                      >
                        <PencilIcon />
                      </button>
                    </div>
                    <span className="doc-item-date">{fmt(d.updated_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Shared With Me Section */}
          <div className="section-header-row" style={{ marginTop: 24 }}>
            <h3 className="section-title">Shared with me</h3>
          </div>

          <div className="doc-list">
            {docs.shared.length === 0 ? (
              <div className="empty-state-box">
                <EmptyDocsIllustration />
                <div className="empty-state-text">Nothing shared with you yet</div>
              </div>
            ) : (
              docs.shared.map((d) => (
                <div key={d.id} className="doc-item-row">
                  <div className="doc-item-left">
                    <Link href={`/doc/${d.id}`} className="doc-item-title">
                      {d.title}
                    </Link>
                    <span className="badge-shared">Shared by {d.owner_name}</span>
                  </div>

                  <div className="doc-item-right">
                    <div className="doc-action-icons">
                      <button
                        className="action-icon-btn"
                        title="View document"
                        onClick={() => router.push(`/doc/${d.id}`)}
                      >
                        <EyeIcon />
                      </button>
                    </div>
                    <span className="doc-item-date">{fmt(d.updated_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
