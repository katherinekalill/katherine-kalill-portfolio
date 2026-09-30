import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

const base = '/katherine-kalill-portfolio';
const root = resolve(process.env.PREVIEW_DIRECTORY ?? 'dist');
const port = Number(process.env.PORT ?? 4321);
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

async function resolvePage(pathname) {
  let destination = resolve(root, `.${pathname}`);
  if (destination !== root && !destination.startsWith(`${root}${sep}`))
    return undefined;

  try {
    const details = await stat(destination);
    if (details.isDirectory()) destination = join(destination, 'index.html');
    if ((await stat(destination)).isFile()) return destination;
  } catch {
    if (!extname(destination)) {
      for (const candidate of [
        `${destination}/index.html`,
        `${destination}.html`,
      ]) {
        try {
          if ((await stat(candidate)).isFile()) return candidate;
        } catch {
          // Check the next static-route format.
        }
      }
    }
  }
  return undefined;
}

createServer(async (request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(request.url ?? '/', 'http://localhost').pathname,
    );
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  if (pathname !== base && !pathname.startsWith(`${base}/`)) {
    response.writeHead(404).end('Not found');
    return;
  }

  const relativePath = pathname.slice(base.length) || '/';
  const destination = await resolvePage(relativePath);
  const file = destination ?? join(root, '404.html');
  try {
    const details = await stat(file);
    response.writeHead(destination ? 200 : 404, {
      'content-type': types[extname(file)] ?? 'application/octet-stream',
      'content-length': details.size,
      'x-content-type-options': 'nosniff',
    });
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).pipe(response);
  } catch {
    response
      .writeHead(500)
      .end('Static preview is missing its built 404 page.');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(
    `Static preview serving ${root} at http://127.0.0.1:${port}${base}/`,
  );
});
