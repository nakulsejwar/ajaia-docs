import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'node:crypto';
import { q } from './db';

const DAYS = 7;
const hash = (t) => createHash('sha256').update(t).digest('hex');

// Server-side sessions: the cookie holds a random token; only its SHA-256 is stored, so sessions are revocable.
export async function startSession(userId) {
  const token = randomBytes(32).toString('hex');
  await q`insert into sessions (token_hash, user_id, expires_at) values (${hash(token)}, ${userId}, now() + interval '7 days')`;
  cookies().set('sid', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: DAYS * 86400 });
}

export async function endSession() {
  const t = cookies().get('sid')?.value;
  if (t) await q`delete from sessions where token_hash=${hash(t)}`;
  cookies().delete('sid');
}

export async function currentUser() {
  const t = cookies().get('sid')?.value;
  if (!t) return null;
  const r = await q`select u.id, u.name, u.email from sessions s join users u on u.id=s.user_id
    where s.token_hash=${hash(t)} and s.expires_at > now()`;
  return r[0] || null;
}
