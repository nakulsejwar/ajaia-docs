import { q } from '@/lib/db';
import { json } from '@/lib/server';
import { startSession } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';

const DUMMY = '00:00'; // keeps response time similar when the email is unknown

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== 'string' || typeof password !== 'string') return json({ error: 'Enter your email and password.' }, 400);
    const u = (await q`select id, password_hash from users where email=${email.trim().toLowerCase()}`)[0];
    const ok = await verifyPassword(password, u?.password_hash || DUMMY);
    if (!u || !ok) return json({ error: 'Incorrect email or password.' }, 401);
    await startSession(u.id);
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: 'Could not sign in. Try again.' }, 500);
  }
}
