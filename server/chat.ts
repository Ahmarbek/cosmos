import { CHARACTER_BY_ID, buildSystemPrompt } from '../src/data/characters';
import { mockReply } from '../src/lib/ai/mock';
import type { ChatRequest, ChatResponse } from '../src/lib/ai/types';

/**
 * /api/chat — one handler, two backends.
 *
 * With ANTHROPIC_API_KEY set it calls the Messages API with the character's
 * system prompt, its knowledge base and the conversation so far. Without a key
 * it answers from the local retrieval engine. The response shape is identical
 * either way, and it always reports which one answered so the interface can
 * label it honestly.
 *
 * Swapping in a different provider means replacing callModel below — nothing
 * else in the project knows how the answer was produced.
 */

const MODEL = process.env.COSMOS_MODEL ?? 'claude-opus-5';
const MAX_HISTORY = 12;

function sanitise(body: unknown): ChatRequest | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  if (typeof b.character !== 'string' || typeof b.message !== 'string') return null;
  const history = Array.isArray(b.history) ? b.history : [];
  return {
    character: b.character.slice(0, 64),
    message: b.message.slice(0, 1200),
    history: history
      .filter(
        (m): m is { role: 'user' | 'assistant'; content: string } =>
          typeof m === 'object' &&
          m !== null &&
          (('role' in m && (m as { role: string }).role === 'user') ||
            (m as { role: string }).role === 'assistant') &&
          typeof (m as { content: unknown }).content === 'string'
      )
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) })),
  };
}

async function callModel(req: ChatRequest, apiKey: string): Promise<ChatResponse> {
  const c = CHARACTER_BY_ID[req.character];
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 320,
      system: buildSystemPrompt(c),
      messages: [...req.history, { role: 'user', content: req.message }],
    }),
  });

  if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text =
    data.content
      ?.filter((b) => b.type === 'text')
      .map((b) => b.text ?? '')
      .join('')
      .trim() || '';
  if (!text) throw new Error('empty model response');

  return {
    response: text,
    character: { id: c.id, name: c.name, label: c.label },
    source: 'model',
    model: MODEL,
  };
}

export async function handleChat(body: unknown): Promise<{ status: number; body: unknown }> {
  const req = sanitise(body);
  if (!req) return { status: 400, body: { error: 'character and message are required' } };
  if (!CHARACTER_BY_ID[req.character]) {
    return { status: 404, body: { error: `unknown character: ${req.character}` } };
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    try {
      return { status: 200, body: await callModel(req, key) };
    } catch (err) {
      // a model outage degrades to the local engine rather than to an error
      console.warn('[cosmos] model call failed, falling back to local engine:', err);
    }
  }
  return { status: 200, body: mockReply(req) };
}
