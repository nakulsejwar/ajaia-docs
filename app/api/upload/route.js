import { q } from '@/lib/db';
import { handler, json } from '@/lib/server';
import { ALLOWED, MAX_BYTES, extOf, fileToHtml } from '@/lib/convert';

export const POST = handler(async (req, _ctx, user) => {
  const file = (await req.formData()).get('file');
  if (!file || typeof file === 'string') return json({ error: 'Choose a file to upload.' }, 400);
  const name = file.name || 'upload';
  const ext = extOf(name);
  if (!ALLOWED.includes(ext)) return json({ error: 'Only .txt, .md and .docx files are supported.' }, 400);
  if (file.size > MAX_BYTES) return json({ error: 'File must be 4 MB or smaller.' }, 400);
  let html;
  try {
    html = await fileToHtml(name, ext === '.docx' ? Buffer.from(await file.arrayBuffer()) : await file.text());
  } catch {
    return json({ error: 'Could not read that file. Make sure it is a valid .docx.' }, 400);
  }
  const id = crypto.randomUUID();
  const title = name.replace(/\.[^.]+$/, '').slice(0, 120) || 'Imported document';
  await q`insert into docs (id, title, content, owner_id) values (${id}, ${title}, ${html}, ${user.id})`;
  return json({ id }, 201);
});
