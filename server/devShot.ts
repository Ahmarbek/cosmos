import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

/**
 * Dev-only frame grab.
 *
 * POST a data: URL to /api/__shot and it lands in .shots/ as a PNG. Used while
 * building the scenes to inspect what the renderer actually produced, since an
 * embedded preview pane cannot be trusted to composite a live WebGL canvas.
 * Never mounted in a production build.
 */
export function devShotPlugin(): Plugin {
  const dir = resolve(process.cwd(), '.shots');
  return {
    name: 'cosmos-dev-shot',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/__shot')) return next();
        const chunks: Buffer[] = [];
        req.on('data', (c) => chunks.push(c as Buffer));
        req.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          const name = new URL(req.url!, 'http://x').searchParams.get('name') ?? 'shot';
          const b64 = body.replace(/^data:image\/png;base64,/, '');
          mkdirSync(dir, { recursive: true });
          writeFileSync(resolve(dir, `${name}.png`), Buffer.from(b64, 'base64'));
          res.statusCode = 200;
          res.end('ok');
        });
      });
    },
  };
}
