import { q } from '@/lib/db';
import { handler, json, loadDoc } from '@/lib/server';
import { validateTitle } from '@/lib/access';

export const GET = handler(async (_req, { params }, user) => {
  const r = await loadDoc(params.id, user);
  if (r.error) return json({ error: r.error }, r.status);
  const { doc, role, shares } = r;
  return json({ id: doc.id, title: doc.title, content: doc.content, owner_name: doc.owner_name, role, shares: role === 'owner' ? shares : [] });
});

export const PATCH = handler(async (req, { params }, user) => {
  const r = await loadDoc(params.id, user);
  if (r.error) return json({ error: r.error }, r.status);
  if (r.role !== 'owner' && r.role !== 'editor') {
    return json({ error: 'Viewers cannot edit this document.' }, 403);
  }
  const body = await req.json();
  if (body.title !== undefined) {
    const err = validateTitle(body.title);
    if (err) return json({ error: err }, 400);
    await q`update docs set title=${body.title.trim()}, updated_at=now() where id=${params.id}`;
  }
  if (body.content !== undefined) {
    if (typeof body.content !== 'string' || body.content.length > 500000) return json({ error: 'Content is too large.' }, 400);
    await q`update docs set content=${body.content}, updated_at=now() where id=${params.id}`;

    // Automatically record snapshot in doc_versions (throttled to at most once per 60s per doc)
    try {
      const recent = await q`select id from doc_versions where doc_id=${params.id} and created_at > now() - interval '60 seconds' limit 1`;
      if (recent.length === 0) {
        await q`insert into doc_versions (doc_id, title, content, created_by) values (${params.id}, ${body.title ? body.title.trim() : r.doc.title}, ${body.content}, ${user.id})`;
      }
    } catch (e) {
      console.error('Failed to record version snapshot:', e);
    }
  }
  return json({ ok: true });
});

export const DELETE = handler(async (_req, { params }, user) => {
  const r = await loadDoc(params.id, user);
  if (r.error) return json({ error: r.error }, r.status);
  if (r.role !== 'owner') return json({ error: 'Only the owner can delete.' }, 403);
  await q`delete from docs where id=${params.id}`;
  return json({ ok: true });
});
