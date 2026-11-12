import { q } from '@/lib/db';
import { handler, json } from '@/lib/server';

export const GET = handler(async (_req, _ctx, user) => {
  const owned = await q`select id, title, updated_at from docs where owner_id=${user.id} order by updated_at desc`;
  const shared = await q`select d.id, d.title, d.updated_at, u.name as owner_name
    from shares s join docs d on d.id=s.doc_id join users u on u.id=d.owner_id
    where s.user_id=${user.id} order by d.updated_at desc`;
  return json({ owned, shared });
});

export const POST = handler(async (_req, _ctx, user) => {
  const id = crypto.randomUUID();
  await q`insert into docs (id, title, content, owner_id) values (${id}, 'Untitled document', '', ${user.id})`;
  return json({ id }, 201);
});
