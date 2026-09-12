import { mockProvider, mockReply } from './mock';
import type { ChatProvider, ChatRequest, ChatResponse } from './types';

/**
 * Front end of the chat abstraction.
 *
 * The page always talks to one interface. In development the request goes to
 * /api/chat, which answers with a real model when ANTHROPIC_API_KEY is present
 * and with the local engine when it is not. If the endpoint is missing entirely
 * — a static build with no server — the call falls back to the in-browser mock
 * rather than failing, so the world is never broken by a missing key.
 */

export const httpProvider: ChatProvider = {
  id: 'http',
  async send(req: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req),
      signal,
    });
    if (!res.ok) throw new Error(`chat endpoint returned ${res.status}`);
    return (await res.json()) as ChatResponse;
  },
};

let endpointAlive: boolean | null = null;

export async function sendChat(req: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
  if (endpointAlive !== false) {
    try {
      const r = await httpProvider.send(req, signal);
      endpointAlive = true;
      return r;
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') throw err;
      endpointAlive = false;
    }
  }
  return mockProvider.send(req, signal);
}

export { mockProvider, mockReply };
export type { ChatProvider, ChatRequest, ChatResponse };
