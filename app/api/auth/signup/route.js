import { q } from '@/lib/db';
import { json } from '@/lib/server';
import { startSession } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { validateEmail, validateName, validatePassword } from '@/lib/access';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    const err = validateName(name) || validateEmail(email) || validatePassword(password);
    if (err) return json({ error: err }, 400);
    const em = email.trim().toLowerCase();
    if ((await q`select 1 from users where email=${em}`).length) return json({ error: 'An account with this email already exists.' }, 409);
    const id = crypto.randomUUID();
    await q`insert into users (id, name, email, password_hash) values (${id}, ${name.trim()}, ${em}, ${await hashPassword(password)})`;
    await startSession(id);
    return json({ ok: true }, 201);
  } catch (e) {
    console.error(e);
    return json({ error: 'Could not create the account. Try again.' }, 500);
  }
}
