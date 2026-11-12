import { q } from '@/lib/db';
import { handler, json, loadDoc } from '@/lib/server';

export const GET = handler(async (_req, { params }, user) => {
  const r = await loadDoc(params.id, user);
  if (r.error) return json({ error: r.error }, r.status);
  const versions = await q`
    select v.id, v.title, v.created_at, u.name as created_by_name
    from doc_versions v
    join users u on u.id = v.created_by
    where v.doc_id = ${params.id}
    order by v.created_at desc
    limit 30;
  `;
  return json({ versions });
});

export const POST = handler(async (req, { params }, user) => {
  const r = await loadDoc(params.id, user);
  if (r.error) return json({ error: r.error }, r.status);
  if (r.role !== 'owner' && r.role !== 'editor') {
    return json({ error: 'Viewers cannot restore versions.' }, 403);
  }
  const { versionId } = await req.json();
  const [version] = await q`select * from doc_versions where id = ${versionId} and doc_id = ${params.id}`;
  if (!version) return json({ error: 'Version not found.' }, 404);

  // Save current doc as snapshot before restoring
  await q`insert into doc_versions (doc_id, title, content, created_by) values (${params.id}, ${r.doc.title}, ${r.doc.content}, ${user.id})`;

  // Restore doc
  await q`update docs set title = ${version.title}, content = ${version.content}, updated_at = now() where id = ${params.id}`;
  return json({ ok: true, title: version.title, content: version.content });
});

