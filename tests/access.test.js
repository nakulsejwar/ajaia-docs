import { describe, it, expect } from 'vitest';
import { getRole, validateTitle, validateEmail, validatePassword } from '../lib/access';
import { fileToHtml } from '../lib/convert';
import { hashPassword, verifyPassword } from '../lib/password';

const doc = { id: 'd1', owner_id: 'alice' };

describe('sharing / access logic', () => {
  it('owner has owner role', () => expect(getRole(doc, 'alice', [])).toBe('owner'));
  it('shared user is an editor', () => expect(getRole(doc, 'bob', ['bob'])).toBe('editor'));
  it('shared user with viewer role has viewer role', () => expect(getRole(doc, 'dan', [{ id: 'dan', role: 'viewer' }])).toBe('viewer'));
  it('unshared user has no access', () => expect(getRole(doc, 'carol', ['bob'])).toBeNull());
  it('missing doc or user has no access', () => {
    expect(getRole(null, 'bob', ['bob'])).toBeNull();
    expect(getRole(doc, null, [])).toBeNull();
  });
});

describe('validation + import', () => {
  it('rejects empty and overlong titles', () => {
    expect(validateTitle('  ')).toBeTruthy();
    expect(validateTitle('x'.repeat(121))).toBeTruthy();
    expect(validateTitle('Roadmap')).toBeNull();
  });
  it('validates email and password', () => {
    expect(validateEmail('nope')).toBeTruthy();
    expect(validateEmail('a@b.co')).toBeNull();
    expect(validatePassword('short')).toBeTruthy();
    expect(validatePassword('longenough1')).toBeNull();
  });
  it('converts markdown headings and escapes plain text', async () => {
    expect(await fileToHtml('a.md', '# Hi')).toContain('<h1');
    expect(await fileToHtml('a.txt', '<b>x</b>\n\ny')).toBe('<p>&lt;b&gt;x&lt;/b&gt;</p><p>y</p>');
  });
  it('rejects a corrupt .docx', async () => {
    await expect(fileToHtml('bad.docx', Buffer.from('not a zip'))).rejects.toThrow();
  });
});

describe('passwords', () => {
  it('verifies the right password and rejects the wrong one', async () => {
    const h = await hashPassword('Password123!');
    expect(h).not.toContain('Password123!');
    expect(await verifyPassword('Password123!', h)).toBe(true);
    expect(await verifyPassword('wrong-password', h)).toBe(false);
    expect(await verifyPassword('x', null)).toBe(false);
  });
});
