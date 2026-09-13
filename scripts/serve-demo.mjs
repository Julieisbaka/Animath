import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml'
};

const aliases = new Map([
  ['/', '/demo/index.html'],
  ['/react.html', '/demo/react.html'],
  ['/gallery.html', '/demo/gallery.html'],
  ['/gallery.js', '/demo/gallery.js']
]);

const server = createServer((request, response) => {
  try {
    const requestPath = decodeURIComponent((request.url ?? '/').split('?')[0] ?? '/');
    const relativePath = aliases.get(requestPath) ?? requestPath;
    let filePath = normalize(join(root, relativePath));
    if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
    const safeRelativePath = relative(root, filePath);
    if (safeRelativePath.startsWith(`..${sep}`) || safeRelativePath === '..' || !existsSync(filePath) || statSync(filePath).isDirectory()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'self' https://esm.sh; script-src 'self' https://esm.sh 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; object-src 'none'; base-uri 'none'",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Internal server error');
  }
});

function listen(port, attemptsLeft) {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && attemptsLeft > 0) {
      listen(port + 1, attemptsLeft - 1);
      return;
    }
    throw error;
  });
  server.listen(port, () => {
    console.log(`Animath dev server running at http://localhost:${port}`);
    console.log('  /              core demo');
    console.log('  /react.html    React demo');
    console.log('  /gallery.html  example gallery');
    console.log('  /docs/         documentation');
    console.log('Press Ctrl+C to stop.');
  });
}

listen(Number(process.env.PORT ?? 4173), 10);
