'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

async function api(url, opts) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function BulletListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}

function NumberedListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6" x2="21" y2="6"/>
      <line x1="10" y1="12" x2="21" y2="12"/>
      <line x1="10" y1="18" x2="21" y2="18"/>
      <path d="M4 6h1v4"/>
      <path d="M4 10h2"/>
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

export default function DocPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [shareRole, setShareRole] = useState('editor');
  const [status, setStatus] = useState('Saved');
  const [error, setError] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [versions, setVersions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const timer = useRef(null);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setStatus('Saving…');
      clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        try {
          await api(`/api/docs/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ content: editor.getHTML() }),
          });
          setStatus('Saved');
          setError('');
        } catch (e) {
          setStatus('Not saved');
          setError(e.message);
        }
      }, 700);
    },
  });

  async function load() {
    try {
      const d = await api(`/api/docs/${id}`);
      setDoc(d);
      setTitle(d.title);
      return d;
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load().then((d) => {
      if (d && editor) {
        editor.commands.setContent(d.content, false);
        if (d.role === 'viewer') {
          editor.setEditable(false);
          setStatus('Read only');
        }
      }
    });
  }, [editor]); // eslint-disable-line

  // Heartbeat for live presence indicators
  useEffect(() => {
    async function heartbeat() {
      try {
        const res = await api(`/api/docs/${id}/presence`, { method: 'POST' });
        if (res.active) setActiveUsers(res.active);
      } catch {}
    }
    heartbeat();
    const interval = setInterval(heartbeat, 8000);
    return () => clearInterval(interval);
  }, [id]);

  async function loadVersions() {
    try {
      const res = await api(`/api/docs/${id}/versions`);
      if (res.versions) setVersions(res.versions);
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleHistory() {
    if (!showHistory) {
      loadVersions();
    }
    setShowHistory(!showHistory);
  }

  async function restoreVersion(versionId) {
    if (!confirm('Restore document to this version? Current content will be saved in history.')) return;
    try {
      const res = await api(`/api/docs/${id}/versions`, {
        method: 'POST',
        body: JSON.stringify({ versionId }),
      });
      if (res.ok) {
        setTitle(res.title);
        if (editor) editor.commands.setContent(res.content, false);
        setStatus('Saved');
        setShowHistory(false);
        loadVersions();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function rename() {
    if (!doc || title.trim() === doc.title) return;
    try {
      await api(`/api/docs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: title.trim() }),
      });
      setDoc({ ...doc, title: title.trim() });
      setError('');
    } catch (e) {
      setError(e.message);
      setTitle(doc.title);
    }
  }

  async function share(method, body) {
    try {
      await api(`/api/docs/${id}/share`, { method, body: JSON.stringify(body) });
      setEmail('');
      await load();
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove() {
    if (!confirm('Delete this document for everyone?')) return;
    try {
      await api(`/api/docs/${id}`, { method: 'DELETE' });
      router.push('/');
    } catch (e) {
      setError(e.message);
    }
  }

  function exportMarkdown() {
    if (!editor) return;
    const html = editor.getHTML();
    const md = html
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u>(.*?)<\/u>/gi, '_$1_')
      .replace(/<li><p>(.*?)<\/p><\/li>/gi, '- $1\n')
      .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<ul>([\s\S]*?)<\/ul>/gi, '$1\n')
      .replace(/<ol>([\s\S]*?)<\/ol>/gi, '$1\n')
      .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.trim() || 'document'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function exportPdf() {
    window.print();
  }

  const textContent = editor ? editor.getText().trim() : '';
  const wordCount = textContent ? textContent.split(/\s+/).length : 0;

  if (!doc) {
    return (
      <div className="editor-viewport">
        <div className="editor-container">
          {error ? (
            <div>
              <div className="auth-error">{error}</div>
              <Link href="/" className="breadcrumb-back">
                ← Back to documents
              </Link>
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Loading…</span>
          )}
        </div>
      </div>
    );
  }

  const isOwner = doc.role === 'owner';
  const isViewer = doc.role === 'viewer';
  const c = () => editor.chain().focus();

  return (
    <div className="editor-viewport">
      <div className="editor-container">
        {/* Top Header / Breadcrumb Bar */}
        <div className="editor-topbar">
          <div className="editor-breadcrumb-area">
            <Link href="/" className="breadcrumb-back">
              ← Documents
            </Link>
            <span className="breadcrumb-sep">/</span>
            <input
              className="editor-title-input"
              value={title}
              disabled={isViewer}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={rename}
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
              aria-label="Document title"
            />
            <span
              className={
                isOwner
                  ? 'badge-owner'
                  : isViewer
                  ? 'badge-shared'
                  : 'badge-shared'
              }
              style={isViewer ? { background: '#fef3c7', color: '#92400e' } : {}}
            >
              {isOwner ? 'Owner' : isViewer ? 'Viewer' : `Shared by ${doc.owner_name}`}
            </span>
            <span className="editor-status-text">
              {status} {editor && `· ${wordCount} ${wordCount === 1 ? 'word' : 'words'}`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Real-time Collaboration Indicators */}
            {activeUsers.length > 0 && (
              <div
                className="presence-container"
                title={`Active viewers: ${activeUsers.map((u) => u.name).join(', ')}`}
              >
                <div className="pulse-dot" />
                <div className="presence-avatars">
                  {activeUsers.map((u) => {
                    const initials = u.name
                      ? u.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'U';
                    return (
                      <div key={u.id} className="presence-avatar" title={`${u.name} (${u.email})`}>
                        {initials}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Version History Button */}
            <button
              type="button"
              className="btn-export-doc"
              onClick={toggleHistory}
              title="Version history"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <HistoryIcon />
              History
            </button>

            {/* Export Buttons */}
            <button
              type="button"
              className="btn-export-doc"
              onClick={exportMarkdown}
              title="Export as Markdown (.md)"
            >
              Export (.md)
            </button>
            <button
              type="button"
              className="btn-export-doc"
              onClick={exportPdf}
              title="Export or Print as PDF"
            >
              Export (.pdf)
            </button>

            {isOwner && (
              <button className="btn-delete-doc" onClick={remove}>
                Delete
              </button>
            )}
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {/* Version History Drawer/Panel */}
        {showHistory && (
          <div className="version-panel">
            <div className="version-panel-header">
              <h4 className="version-panel-title">Document Version History</h4>
              <button
                type="button"
                className="btn-export-doc"
                style={{ padding: '2px 8px', fontSize: 11 }}
                onClick={() => setShowHistory(false)}
              >
                Close
              </button>
            </div>
            {versions.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                No past versions recorded yet. Versions are created automatically as changes are saved.
              </div>
            ) : (
              <div className="version-list">
                {versions.map((v) => (
                  <div key={v.id} className="version-item">
                    <div className="version-item-info">
                      <span className="version-item-title">{v.title}</span>
                      <span className="version-item-meta">
                        Saved by {v.created_by_name} on {new Date(v.created_at).toLocaleString()}
                      </span>
                    </div>
                    {!isViewer && (
                      <button
                        type="button"
                        className="btn-restore-version"
                        onClick={() => restoreVersion(v.id)}
                      >
                        Restore
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Toolbar */}
        {!isViewer && editor && (
          <div className="editor-toolbar" role="toolbar" aria-label="Formatting">
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => c().toggleBold().run()}
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => c().toggleItalic().run()}
              title="Italic"
              style={{ fontStyle: 'italic', fontFamily: 'serif' }}
            >
              I
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => c().toggleUnderline().run()}
              title="Underline"
              style={{ textDecoration: 'underline' }}
            >
              U
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => c().toggleHeading({ level: 1 }).run()}
              title="Heading 1"
              style={{ fontWeight: 700, fontSize: 13 }}
            >
              H1
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => c().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
              style={{ fontWeight: 700, fontSize: 13 }}
            >
              H2
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => c().toggleBulletList().run()}
              title="Bulleted List"
            >
              <BulletListIcon />
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => c().toggleOrderedList().run()}
              title="Numbered List"
            >
              <NumberedListIcon />
            </button>
          </div>
        )}

        {isViewer && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            🔒 You have view-only access to this document.
          </div>
        )}

        {/* Editor Page Card */}
        <div
          className="editor-page-card"
          onClick={() => !isViewer && editor && editor.commands.focus()}
        >
          <h1 className="print-only-title">{title}</h1>
          <EditorContent editor={editor} />
        </div>

        {/* Share Section Card */}
        {isOwner ? (
          <div className="share-section-card">
            <h4 className="share-title">Share</h4>
            <form
              className="share-form-row"
              onSubmit={(e) => {
                e.preventDefault();
                share('POST', { email, role: shareRole });
              }}
            >
              <input
                type="email"
                required
                placeholder="Their email address"
                className="share-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email of person to share with"
              />
              <select
                className="share-role-select"
                value={shareRole}
                onChange={(e) => setShareRole(e.target.value)}
                aria-label="Permission level"
              >
                <option value="editor">Can edit</option>
                <option value="viewer">Can view</option>
              </select>
              <button className="btn-give-access" type="submit">
                Give access
              </button>
            </form>

            {doc.shares.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                Not shared with anyone yet.
              </div>
            ) : (
              <div className="shares-list">
                {doc.shares.map((u) => (
                  <div key={u.id} className="share-item-row">
                    <span>
                      {u.name}{' '}
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        ({u.email})
                      </span>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        className={u.role === 'viewer' ? 'badge-shared' : 'badge-owner'}
                        style={u.role === 'viewer' ? { background: '#fef3c7', color: '#92400e' } : {}}
                      >
                        {u.role === 'viewer' ? 'Viewer' : 'Editor'}
                      </span>
                      <button
                        type="button"
                        className="btn-remove-share"
                        onClick={() => share('DELETE', { userId: u.id })}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="share-section-card" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            You have {isViewer ? 'view-only' : 'editor'} access. Only {doc.owner_name} can change sharing settings.
          </div>
        )}
      </div>
    </div>
  );
}
