// Minimal static server for previewing dist/ at the site root, like GitHub Pages.
// Usage: node scripts/serve.mjs [port]

import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT || process.argv[2] || 4173);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
};

async function resolve(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^[/\\]+/, '');
  if (safe.startsWith('..')) return null;
  let file = join(DIST, safe);
  const info = await stat(file).catch(() => null);
  if (info?.isDirectory()) file = join(file, 'index.html');
  return (await stat(file).catch(() => null))?.isFile() ? file : null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  const file = await resolve(pathname);
  const target = file || join(DIST, '404.html');
  const size = (await stat(target)).size;
  const type = TYPES[extname(target)] || 'application/octet-stream';
  const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
  if (file && range) {
    const start = Number(range[1] || 0);
    const end = range[2] ? Number(range[2]) : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    createReadStream(target, { start, end }).pipe(res);
    return;
  }
  res.writeHead(file ? 200 : 404, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
  createReadStream(target).pipe(res);
}).listen(PORT, () => console.log(`Serving dist/ at http://localhost:${PORT}/`));
