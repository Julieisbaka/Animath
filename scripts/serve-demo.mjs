import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.env.PORT ?? 4173);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

const server = createServer((request, response) => {
  const requestPath = request.url?.split('?')[0] ?? '/';
  const relativePath = requestPath === '/' ? '/demo/index.html'
    : requestPath === '/react.html' ? '/demo/react.html'
      : requestPath;
  let filePath = normalize(join(root, relativePath));
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] ?? 'application/octet-stream' });
  createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
  console.log(`Animath demo running at http://localhost:${port}`);
  console.log('Press Ctrl+C to stop.');
});
