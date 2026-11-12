import { q } from '@/lib/db';
import { handler, json, loadDoc } from '@/lib/server';

export const POST = handler(async (_req, { params }, user) => {
  const r = await loadDoc(params.id, user);
  if (r.error) return json({ error: r.error }, r.status);

  // Record presence heartbeat
  await q`
    insert into doc_presence (doc_id, user_id, last_seen)
    values (${params.id}, ${user.id}, now())
    on conflict (doc_id, user_id) do update set last_seen = now();
  `;

  // Query users active in the last 25 seconds
  const active = await q`
    select u.id, u.name, u.email
    from doc_presence p
    join users u on u.id = p.user_id
    where p.doc_id = ${params.id}
      and p.last_seen > now() - interval '25 seconds'
    order by p.last_seen desc;
  `;

  return json({ active });
});

