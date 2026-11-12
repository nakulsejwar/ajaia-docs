import { json } from '@/lib/server';
import { endSession } from '@/lib/auth';

export async function POST() {
  try { await endSession(); } catch (e) { console.error(e); }
  return json({ ok: true });
}
