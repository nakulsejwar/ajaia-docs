import { q } from './db';
import { currentUser } from './auth';
import { getRole } from './access';

export const json = (data, status = 200) => Response.json(data, { status });

// Wraps a handler: auth check + uniform error handling.
export function handler(fn) {
  return async (req, ctx) => {
    try {
      const user = await currentUser();
      if (!user) return json({ error: 'Not signed in.' }, 401);
      return await fn(req, ctx, user);
    } catch (e) {
      console.error(e);
      return json({ error: 'Something went wrong. Try again.' }, 500);
    }
  };
}

export async function loadDoc(id, user) {
  const doc = (await q`select d.*, u.name as owner_name from docs d join users u on u.id=d.owner_id where d.id=${id}`)[0];
  if (!doc) return { status: 404, error: 'Document not found.' };
  const shares = await q`select u.id, u.name, u.email, coalesce(s.role, 'editor') as role from shares s join users u on u.id=s.user_id where s.doc_id=${id} order by u.name`;
  const role = getRole(doc, user.id, shares);
  if (!role) return { status: 403, error: 'You do not have access to this document.' };
  return { doc, role, shares };
}
