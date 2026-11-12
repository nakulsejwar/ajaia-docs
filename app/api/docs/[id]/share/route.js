import { q } from '@/lib/db';
import { handler, json, loadDoc } from '@/lib/server';
import { validateEmail } from '@/lib/access';

async function ownerCheck(params, user) {
  const r = await loadDoc(params.id, user);
  if (r.error) return { res: json({ error: r.error }, r.status) };
  if (r.role !== 'owner') return { res: json({ error: 'Only the owner can change sharing.' }, 403) };
  return {};
}

export const POST = handler(async (req, { params }, user) => {
  const c = await ownerCheck(params, user);
  if (c.res) return c.res;
  const body = await req.json();
  const { email } = body;
  const role = body.role === 'viewer' ? 'viewer' : 'editor';
  const err = validateEmail(email);
  if (err) return json({ error: err }, 400);
  const target = (await q`select id from users where email=${email.trim().toLowerCase()}`)[0];
  if (!target) return json({ error: 'No account with that email. Ask them to sign up first.' }, 404);
  if (target.id === user.id) return json({ error: 'You already own this document.' }, 400);
  await q`insert into shares (doc_id, user_id, role) values (${params.id}, ${target.id}, ${role})
    on conflict (doc_id, user_id) do update set role = excluded.role`;
  return json({ ok: true });
});

export const DELETE = handler(async (req, { params }, user) => {
  const c = await ownerCheck(params, user);
  if (c.res) return c.res;
  const { userId } = await req.json();
  await q`delete from shares where doc_id=${params.id} and user_id=${String(userId)}`;
  return json({ ok: true });
});
