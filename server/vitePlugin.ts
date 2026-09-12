import type { Plugin } from 'vite';
import { handleChat } from './chat';

/** Mounts /api/chat on the dev and preview servers. */
export function chatApiPlugin(): Plugin {
  const middleware = async (
    req: { url?: string; method?: string; on: (e: string, cb: (c?: unknown) => void) => void },
    res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b?: string) => void },
    next: () => void
  ) => {
    if (!req.url?.startsWith('/api/chat')) return next();
    if (req.method !== 'POST') {
      res.statusCode = 405;
      return res.end('Method Not Allowed');
    }
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c as Buffer));
    req.on('end', async () => {
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      } catch {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'invalid JSON' }));
      }
      const { status, body } = await handleChat(parsed);
      res.statusCode = status;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(body));
    });
  };

  return {
    name: 'cosmos-chat-api',
    configureServer(server) {
      server.middlewares.use(middleware as never);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware as never);
    },
  };
}
