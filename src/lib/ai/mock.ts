import { CHARACTER_BY_ID } from '../../data/characters';
import type { ChatProvider, ChatRequest, ChatResponse } from './types';

/**
 * The offline character engine.
 *
 * With no API key configured the world still has to work, so this does honest
 * retrieval instead of pretending to be a language model: it scores the
 * character's knowledge base against the question, picks what fits, and frames
 * it in that character's register. Answers stay inside documented fact, and
 * when nothing matches it says so rather than improvising.
 */

const STOP = new Set([
  'what', 'was', 'were', 'your', 'you', 'the', 'a', 'an', 'is', 'are', 'did', 'do', 'does',
  'how', 'why', 'when', 'who', 'tell', 'me', 'about', 'of', 'to', 'in', 'on', 'for', 'and',
  'with', 'that', 'this', 'it', 'i', 'my', 'like', 'would', 'could', 'can', 'give', 'any',
  'most', 'best', 'think', 'feel', 'have', 'has', 'had', 'been', 'their', 'they',
]);

const tokens = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s’'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

type Intent = 'inspiration' | 'career' | 'advice' | 'proud' | 'identity' | 'early' | 'legacy' | 'general';

/**
 * Questions about what this thing actually is. Deliberately narrow: a loose
 * pattern here swallows ordinary questions — "are you proudest of" begins with
 * "are you" and has nothing to do with identity.
 */
const IDENTITY =
  /\b(are|is)\s+(you|this|it)\b.{0,18}\b(real|really|actually|ai|bot|human|simulation|program|machine)\b|\breally\s+(you|him|her)\b|\bthe\s+real\s+(you|person|thing)\b|\b(an?\s+)?(ai|bot|chatbot|simulation)\s*\??$|\btalking\s+to\s+(an?\s+)?(ai|bot|machine|computer)\b/;

function detectIntent(q: string): Intent {
  const s = q.toLowerCase();
  if (IDENTITY.test(s)) return 'identity';
  if (/(inspir|motivat|drove you|why did you start|passion)/.test(s)) return 'inspiration';
  if (/(advice|tell someone|young|starting out|lesson|learn)/.test(s)) return 'advice';
  if (/(proud|greatest|favourite|favorite|best moment|highlight)/.test(s)) return 'proud';
  if (/(career|journey|path|club|team|work life|your work)/.test(s)) return 'career';
  if (/(child|young|grow|born|early|beginning|start)/.test(s)) return 'early';
  if (/(legacy|remember|impact|influence|change)/.test(s)) return 'legacy';
  return 'general';
}

function score(fact: string, qs: string[]) {
  const f = fact.toLowerCase();
  let s = 0;
  for (const t of qs) if (f.includes(t)) s += t.length > 5 ? 3 : 2;
  return s;
}

const OPENERS: Record<Intent, string[]> = {
  inspiration: ['What kept me at it was simple enough.', 'The pull was never complicated.'],
  career: ['The shape of it, briefly.', 'If you want the route, it went like this.'],
  advice: ['Take this for what it is worth.', 'One thing, and only one.'],
  proud: ['If I had to pick one.', 'The one that still holds up.'],
  early: ['The beginning is the part people skip.', 'It started smaller than you think.'],
  legacy: ['That is not really mine to measure.', 'What lasted was not what I expected.'],
  identity: [],
  general: ['Here is what I can tell you.', 'On that, the record is clear enough.'],
};

const CLOSERS: Record<Intent, string[]> = {
  inspiration: ['The rest was repetition.', 'Everything after that was work.'],
  career: ['Then it kept going.', 'That is the outline; the detail is in the years.'],
  advice: ['Do that for long enough and the rest follows.', 'Nobody can do that part for you.'],
  proud: ['That is the one.', 'It cost what it cost.'],
  early: ['Everything later grew out of that.', 'You do not choose the beginning.'],
  legacy: ['Others decide what that was worth.', 'I only did the work.'],
  identity: [],
  general: ['Ask me something narrower and I can go deeper.', 'There is more, if you want it.'],
};

const pick = <T,>(arr: T[], seed: number) => arr[seed % arr.length];

export function mockReply(req: ChatRequest): ChatResponse {
  const c = CHARACTER_BY_ID[req.character];
  if (!c) {
    return {
      response: 'That character is not part of this hall.',
      character: { id: req.character, name: 'Unknown', label: 'Interactive AI character' },
      source: 'mock',
    };
  }

  const intent = detectIntent(req.message);
  const seed = req.history.length + req.message.length;
  const meta = { id: c.id, name: c.name, label: c.label };

  if (intent === 'identity') {
    return {
      response: `I am a simulation, not ${c.name}. Everything I say is assembled from public record about ${c.name.split(' ')[0]} — nothing private, nothing invented, and no real quotations.`,
      character: meta,
      source: 'mock',
    };
  }

  const qs = tokens(req.message);
  const ranked = c.knowledgeBase
    .map((fact) => ({ fact, s: score(fact, qs) }))
    .sort((a, b) => b.s - a.s);

  // avoid repeating a fact already used in this conversation
  const used = new Set(
    req.history.filter((m) => m.role === 'assistant').flatMap((m) => m.content.split('. '))
  );

  const byIntent: Record<Intent, (f: string) => boolean> = {
    inspiration: (f) => /begin|began|joined|first|academy|apprentic|child|studied/i.test(f),
    career: (f) => /^Work:|^\d{4}|signed|joined|moved|released|title/i.test(f),
    advice: (f) => /repeat|rebuil|disciplin|work|refus|control|study|observ/i.test(f),
    proud: (f) => /^Achievement:/i.test(f),
    early: (f) => /child|born|young|academy|apprentic|grew|first/i.test(f),
    legacy: (f) => f === c.knowledgeBase[c.knowledgeBase.length - 1] || /remain|reshaped|standard|reference|influenc|changed/i.test(f),
    identity: () => false,
    general: () => true,
  };

  const preferred = ranked.filter((r) => r.s > 0);
  const pool = (preferred.length ? preferred : ranked.filter((r) => byIntent[intent](r.fact)))
    .map((r) => r.fact)
    .filter((f) => !used.has(f));

  const chosen = (pool.length ? pool : c.knowledgeBase).slice(0, 2);

  const clean = chosen.map((f) => {
    const t = f
      .replace(/^(Achievement|Work):\s*/, '')
      // dated entries read as dossier lines, which avoids a mid-sentence capital
      .replace(/^(\d{4}|c\.\s?\d{4}):\s*/, (_m, year: string) => `${year.trim()} — `)
      .trim();
    // facts are stored as fragments; sentences need their own full stops or the
    // reply runs two unrelated statements together
    return /[.!?]$/.test(t) ? t : `${t}.`;
  });

  const opener = pick(OPENERS[intent], seed);
  const closer = pick(CLOSERS[intent], seed + 1);
  const body = clean.join(' ');

  const response = [opener, body, closer].filter(Boolean).join(' ');

  return { response, character: meta, source: 'mock' };
}

export const mockProvider: ChatProvider = {
  id: 'mock',
  async send(req) {
    // a beat of latency, so the interface behaves the same as it will with a model
    await new Promise((r) => setTimeout(r, 420 + Math.random() * 520));
    return mockReply(req);
  },
};
