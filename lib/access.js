// Pure access logic: owner > editor / viewer (shared) > none.
export function getRole(doc, userId, shares = []) {
  if (!doc || !userId) return null;
  if (doc.owner_id === userId) return 'owner';
  const match = shares.find((s) => (typeof s === 'string' ? s === userId : s.user_id === userId || s.id === userId));
  if (!match) return null;
  return typeof match === 'object' && match.role ? match.role : 'editor';
}

export function validateTitle(t) {
  if (typeof t !== 'string') return 'Title must be text.';
  const s = t.trim();
  if (!s) return 'Title cannot be empty.';
  if (s.length > 120) return 'Title must be 120 characters or fewer.';
  return null;
}

export function validateEmail(e) {
  if (typeof e !== 'string' || e.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())) return 'Enter a valid email address.';
  return null;
}
export function validatePassword(p) {
  if (typeof p !== 'string' || p.length < 8) return 'Password must be at least 8 characters.';
  if (p.length > 200) return 'Password is too long.';
  return null;
}
export function validateName(n) {
  if (typeof n !== 'string' || !n.trim() || n.trim().length > 80) return 'Enter your name (80 characters or fewer).';
  return null;
}
