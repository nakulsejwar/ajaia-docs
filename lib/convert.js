import { marked } from 'marked';

export const ALLOWED = ['.txt', '.md', '.docx'];
export const MAX_BYTES = 4 * 1024 * 1024; // stays under Vercel's 4.5 MB request limit

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const extOf = (name) => (name.includes('.') ? name.toLowerCase().slice(name.lastIndexOf('.')) : '');

// Returns editor-ready HTML. The Tiptap schema strips anything it doesn't support on load.
// `data` is a string for .txt/.md and a Buffer for .docx.
export async function fileToHtml(name, data) {
  const ext = extOf(name);
  if (ext === '.docx') {
    const mammoth = (await import('mammoth')).default;
    const { value } = await mammoth.convertToHtml({ buffer: data });
    return value;
  }
  if (ext === '.md') return marked.parse(data, { async: false });
  return data.split(/\n{2,}/).filter(Boolean).map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
}
