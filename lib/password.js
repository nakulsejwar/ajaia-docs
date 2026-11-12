import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const sc = promisify(scrypt);

// scrypt with a per-password random salt. Stored as "salt:hash" (hex).
export async function hashPassword(pw) {
  const salt = randomBytes(16);
  const h = await sc(pw, salt, 64);
  return `${salt.toString('hex')}:${h.toString('hex')}`;
}

export async function verifyPassword(pw, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [s, h] = stored.split(':');
  const expected = Buffer.from(h, 'hex');
  const actual = await sc(pw, Buffer.from(s, 'hex'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
