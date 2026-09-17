import { CHARACTER_BY_ID } from '../../data/characters';
import { tr, type L, type Lang } from '../../i18n/lang';
import { UI } from '../../i18n/ui';
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
  // Uzbek function words, which would otherwise score against every fact
  'nima', 'qanday', 'qachon', 'kim', 'nega', 'qayer', 'qaysi', 'siz', 'sizning', 'sen',
  'men', 'mening', 'bu', 'shu', 'oʻsha', 'uchun', 'bilan', 'haqida', 'edi',
  'boʻldi', 'boʻlgan', 'qilgan', 'ayting', 'aytib', 'bering',
  'gapiring', 'eng', 'koʻp', 'ham', 'yoki', 'lekin', 'ammo', 'juda', 'bir',
  'har', 'kerak', 'mumkin',
]);

const tokens = (s: string) =>
  s
    .toLowerCase()
    // Uzbek Latin carries oʻ, gʻ and the glottal ʼ; an a-z filter would cut
    // every word containing one in half and score the halves against nothing
    .replace(/[^a-z0-9\u02bb\u02bc\u2018\u2019\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

type Intent = 'inspiration' | 'career' | 'advice' | 'proud' | 'identity' | 'early' | 'legacy' | 'general';

/**
 * Questions about what this thing actually is. Deliberately narrow: a loose
 * pattern here swallows ordinary questions — "are you proudest of" begins with
 * "are you" and has nothing to do with identity.
 */
const IDENTITY =
  /\b(are|is)\s+(you|this|it)\b.{0,18}\b(real|really|actually|ai|bot|human|simulation|program|machine)\b|\breally\s+(you|him|her)\b|\bthe\s+real\s+(you|person|thing)\b|\b(an?\s+)?(ai|bot|chatbot|simulation)\s*\??$|\btalking\s+to\s+(an?\s+)?(ai|bot|machine|computer)\b|\b(haqiqiy|haqiqatan|rostdan|chindan)\b[^?]{0,28}\b(odam|inson|o\u02bbzi|siz\b)|\b(robot|chatbot|dastur|taqlid|simulyatsiya|odam|inson)mi|\bsun[\u02bc\u02bb']?iy\s+intellekt/;

function detectIntent(q: string): Intent {
  const s = q.toLowerCase();
  if (IDENTITY.test(s)) return 'identity';
  if (/(inspir|motivat|drove you|why did you start|passion|ilhom|nega boshla|turtki|ishtiyoq)/.test(s)) return 'inspiration';
  if (/(advice|tell someone|young|starting out|lesson|learn|maslahat|o\u02bbrgan|saboq|tavsiya)/.test(s)) return 'advice';
  if (/(proud|greatest|favourite|favorite|best moment|highlight|faxr|g\u02bburur|eng yaxshi|yutuq)/.test(s)) return 'proud';
  if (/(career|journey|path|club|team|work life|your work|karyera|yo\u02bbl|klub|jamoa|ijod|faoliyat)/.test(s)) return 'career';
  if (/(child|young|grow|born|early|beginning|start|bolalik|tug\u02bbil|o\u02bbsgan|boshlan|dastlab)/.test(s)) return 'early';
  if (/(legacy|remember|impact|influence|change|meros|ta\u02bcsir|xotira|o\u02bbzgartir)/.test(s)) return 'legacy';
  return 'general';
}

function score(fact: string, qs: string[]) {
  const f = fact.toLowerCase();
  let s = 0;
  for (const t of qs) if (f.includes(t)) s += t.length > 5 ? 3 : 2;
  return s;
}

const OPENERS: Record<Intent, L[]> = {
  inspiration: [
    { en: 'What kept me at it was simple enough.', uz: 'Meni ushlab turgan narsa juda oddiy edi.' },
    { en: 'The pull was never complicated.', uz: 'Bu tortishuv hech qachon murakkab boʻlmagan.' },
  ],
  career: [
    { en: 'The shape of it, briefly.', uz: 'Qisqacha shakli shunday.' },
    { en: 'If you want the route, it went like this.', uz: 'Yoʻlni bilmoqchi boʻlsangiz, u mana bunday kechdi.' },
  ],
  advice: [
    { en: 'Take this for what it is worth.', uz: 'Buni qanday boʻlsa, shundayligicha qabul qiling.' },
    { en: 'One thing, and only one.', uz: 'Bitta narsa, faqat bitta.' },
  ],
  proud: [
    { en: 'If I had to pick one.', uz: 'Bittasini tanlashim kerak boʻlsa.' },
    { en: 'The one that still holds up.', uz: 'Hamon oʻz qadrini yoʻqotmagani.' },
  ],
  early: [
    { en: 'The beginning is the part people skip.', uz: 'Boshlanishni odamlar odatda oʻtkazib yuboradi.' },
    { en: 'It started smaller than you think.', uz: 'Hammasi siz oʻylagandan kichikroq boshlangan.' },
  ],
  legacy: [
    { en: 'That is not really mine to measure.', uz: 'Buni oʻlchash menga tegishli emas.' },
    { en: 'What lasted was not what I expected.', uz: 'Saqlanib qolgani men kutgan narsa boʻlmadi.' },
  ],
  identity: [],
  general: [
    { en: 'Here is what I can tell you.', uz: 'Mana, sizga nima ayta olaman.' },
    { en: 'On that, the record is clear enough.', uz: 'Bu borada hujjatlar yetarlicha aniq.' },
  ],
};

const CLOSERS: Record<Intent, L[]> = {
  inspiration: [
    { en: 'The rest was repetition.', uz: 'Qolgani takror edi.' },
    { en: 'Everything after that was work.', uz: 'Undan keyingi hamma narsa mehnat boʻldi.' },
  ],
  career: [
    { en: 'Then it kept going.', uz: 'Keyin davom etaverdi.' },
    { en: 'That is the outline; the detail is in the years.', uz: 'Bu umumiy chizgi; tafsilot yillar ichida.' },
  ],
  advice: [
    { en: 'Do that for long enough and the rest follows.', uz: 'Buni yetarlicha uzoq qiling, qolgani oʻzi keladi.' },
    { en: 'Nobody can do that part for you.', uz: 'Bu qismini sizning oʻrningizga hech kim qilib berolmaydi.' },
  ],
  proud: [
    { en: 'That is the one.', uz: 'Aynan oʻsha.' },
    { en: 'It cost what it cost.', uz: 'Qanchaga tushgan boʻlsa, shunchaga tushdi.' },
  ],
  early: [
    { en: 'Everything later grew out of that.', uz: 'Keyingi hamma narsa shundan oʻsib chiqdi.' },
    { en: 'You do not choose the beginning.', uz: 'Boshlanishni odam tanlamaydi.' },
  ],
  legacy: [
    { en: 'Others decide what that was worth.', uz: 'Uning qadrini boshqalar belgilaydi.' },
    { en: 'I only did the work.', uz: 'Men faqat ishimni qildim.' },
  ],
  identity: [],
  general: [
    { en: 'Ask me something narrower and I can go deeper.', uz: 'Torroq savol bering, chuqurroq gapira olaman.' },
    { en: 'There is more, if you want it.', uz: 'Xohlasangiz, davomi bor.' },
  ],
};

const pick = <T,>(arr: T[], seed: number) => arr[seed % arr.length];

export function mockReply(req: ChatRequest): ChatResponse {
  const lang: Lang = req.lang ?? 'en';
  const t = (v: L | string) => tr(v, lang);

  const c = CHARACTER_BY_ID[req.character];
  if (!c) {
    return {
      response: t(UI.notInThisHall),
      character: { id: req.character, name: t(UI.unknown), label: t(UI.interactiveAiCharacter) },
      source: 'mock',
    };
  }

  const intent = detectIntent(req.message);
  const seed = req.history.length + req.message.length;
  const meta = { id: c.id, name: c.name, label: t(c.label) };

  // The knowledge base is a set of pairs; the engine works on the language the
  // question will be answered in, so scoring and matching stay in step.
  const facts = c.knowledgeBase.map(t);

  if (intent === 'identity') {
    const first = c.name.split(' ')[0];
    return {
      response:
        lang === 'uz'
          ? `Men taqlidman, ${c.name} emasman. Aytayotganlarimning hammasi ${first} haqidagi ochiq maʼlumotdan yigʻilgan — shaxsiy hech narsa, oʻylab topilgan hech narsa va haqiqiy iqtiboslar yoʻq.`
          : `I am a simulation, not ${c.name}. Everything I say is assembled from public record about ${first} — nothing private, nothing invented, and no real quotations.`,
      character: meta,
      source: 'mock',
    };
  }

  const qs = tokens(req.message);
  const ranked = facts
    .map((fact) => ({ fact, s: score(fact, qs) }))
    .sort((a, b) => b.s - a.s);

  // avoid repeating a fact already used in this conversation
  const used = new Set(
    req.history.filter((m) => m.role === 'assistant').flatMap((m) => m.content.split('. '))
  );

  const byIntent: Record<Intent, (f: string) => boolean> = {
    inspiration: (f) => /begin|began|joined|first|academy|apprentic|child|studied|boshla|qo\u02bbshil|ilk|akademiya|shogird|bolalig|ta\u02bclim/i.test(f),
    career: (f) => /^Work:|^Ish:|^\d{4}|signed|joined|moved|released|title|shartnoma|qo\u02bbshil|o\u02bbtadi|chiqadi|chempion|imzola/i.test(f),
    advice: (f) => /repeat|rebuil|disciplin|work|refus|control|study|observ|takror|qayta qur|intizom|mehnat|bosh tort|nazorat|kuzat/i.test(f),
    proud: (f) => /^Achievement:|^Yutuq:/i.test(f),
    early: (f) => /child|born|young|academy|apprentic|grew|first|bolalig|tug\u02bbil|akademiya|shogird|o\u02bbsdi|ilk/i.test(f),
    legacy: (f) => f === facts[facts.length - 1] || /remain|reshaped|standard|reference|influenc|changed|qolmoqda|shakllantir|andoza|o\u02bblchov|ta\u02bcsir|o\u02bbzgartir/i.test(f),
    identity: () => false,
    general: () => true,
  };

  const preferred = ranked.filter((r) => r.s > 0);
  const pool = (preferred.length ? preferred : ranked.filter((r) => byIntent[intent](r.fact)))
    .map((r) => r.fact)
    .filter((f) => !used.has(f));

  const chosen = (pool.length ? pool : facts).slice(0, 2);

  const clean = chosen.map((f) => {
    const t = f
      .replace(/^(Achievement|Work|Yutuq|Ish):\s*/, '')
      // dated entries read as dossier lines, which avoids a mid-sentence capital
      .replace(/^(\d{4}|c\.\s?\d{4}):\s*/, (_m, year: string) => `${year.trim()} — `)
      .trim();
    // facts are stored as fragments; sentences need their own full stops or the
    // reply runs two unrelated statements together
    return /[.!?]$/.test(t) ? t : `${t}.`;
  });

  const opener = OPENERS[intent].length ? t(pick(OPENERS[intent], seed)) : '';
  const closer = CLOSERS[intent].length ? t(pick(CLOSERS[intent], seed + 1)) : '';
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
