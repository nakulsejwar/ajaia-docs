import { json } from '@/lib/server';
import { currentUser } from '@/lib/auth';

export async function GET() {
  try { return json({ me: await currentUser() }); }
  catch (e) { console.error(e); return json({ error: 'Database unavailable. Check DATABASE_URL.' }, 500); }
}
