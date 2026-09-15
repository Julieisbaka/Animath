import { createReadStream, existsSync, realpathSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml'
};

const realRoot = realpathSync(root);

const server = createServer((request, response) => {
  try {
    let requestPath;
    try {
      requestPath = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    } catch {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Bad request');
      return;
    }
    if (requestPath.includes('\0')) {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Bad request');
      return;
    }
    const relativePath = requestPath;
    let filePath = normalize(join(root, relativePath));
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      if (!requestPath.endsWith('/')) {
        response.writeHead(301, { Location: `${requestPath}/${new URL(request.url ?? '/', 'http://localhost').search}` });
        response.end();
        return;
      }
      filePath = join(filePath, 'index.html');
    }
    const safeRelativePath = relative(root, filePath);
    const resolvedPath = existsSync(filePath) ? realpathSync(filePath) : filePath;
    const resolvedRelativePath = relative(realRoot, resolvedPath);
    const publicPath = safeRelativePath.split(sep).join('/');
    const isPublicPath = publicPath.startsWith('docs/') || publicPath.startsWith('dist/') || publicPath.startsWith('node_modules/katex/');
    if (safeRelativePath.startsWith(`..${sep}`) || safeRelativePath === '..' || resolvedRelativePath.startsWith(`..${sep}`) || resolvedRelativePath === '..' || !isPublicPath || !existsSync(filePath) || statSync(filePath).isDirectory()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'self' https://esm.sh; script-src 'self' https://esm.sh 'sha256-pDt//6nIR9Wu5JdrSJkeF62uMB+Eli1IOfv5dmLgbUw='; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; object-src 'none'; base-uri 'none'",
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
    console.log('  /docs/                   documentation');
    console.log('  /docs/examples/          example gallery');
    console.log('  /docs/examples/core.html  core example');
    console.log('  /docs/examples/react.html React example');
    console.log('Press Ctrl+C to stop.');
  });
}

listen(Number(process.env.PORT ?? 4173), 10);
