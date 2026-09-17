import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHARACTER_BY_ID } from '../data/characters';
import { useLang, useT } from '../i18n';
import { UI } from '../i18n/ui';
import { sendChat } from '../lib/ai/provider';
import type { ChatMessage } from '../lib/ai/types';
import { useStore } from '../state/useStore';
import { blip } from '../lib/audio';

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The conversation interface.
 *
 * Every surface of it says what this is: a simulation, built from public
 * record, answered either by a language model or by the local engine — and the
 * panel reports which one replied rather than leaving it ambiguous.
 */
export default function ChatPanel() {
  const t = useT();
  const lang = useLang();
  const chatWith = useStore((s) => s.chatWith);
  const setChatWith = useStore((s) => s.setChatWith);
  const isTouch = useStore((s) => s.isTouch);
  const character = chatWith ? CHARACTER_BY_ID[chatWith] : null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState<'mock' | 'model' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([]);
    setDraft('');
    setError(null);
    setSource(null);
    abort.current?.abort();
    if (character) setTimeout(() => input.current?.focus(), 420);
  }, [character]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || !character || busy) return;
    blip(640, 0.07, 0.035);
    const history = messages.slice(-10);
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setDraft('');
    setBusy(true);
    setError(null);

    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;

    try {
      const res = await sendChat({ character: character.id, message: q, history, lang }, ctrl.signal);
      setSource(res.source);
      setMessages((m) => [...m, { role: 'assistant', content: res.response }]);
      blip(880, 0.07, 0.03);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setError(t(UI.characterUnreachable));
    } finally {
      setBusy(false);
    }
  };

  if (!character) return <AnimatePresence />;

  return (
    <AnimatePresence>
      <motion.aside
        className="fixed inset-y-0 right-0 z-[80] w-[min(560px,100vw)] bg-[rgba(3,4,9,0.94)] backdrop-blur-xl flex flex-col hair-l"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.7, ease }}
        role="dialog"
        aria-label={`Conversation with the ${character.name} AI character`}
      >
        <div
          className="absolute inset-x-0 top-0 h-40 pointer-events-none"
          style={{ background: `linear-gradient(180deg, ${character.palette[1]}33, transparent)` }}
        />

        <header className="relative px-8 pt-9 pb-6 hair-b">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="t-eyebrow mb-3" style={{ color: character.palette[0] }}>
                {t(character.label)}
              </p>
              <h3 className="font-display text-4xl leading-none">{character.name}</h3>
            </div>
            <button
              onClick={() => setChatWith(null)}
              className="t-eyebrow hover:text-bone transition-colors duration-500 shrink-0 pt-1"
              data-cursor="hover"
            >
              {t(UI.close)} ✕
            </button>
          </div>
          <p className="mt-5 text-[0.68rem] leading-relaxed text-smoke/80">
            {t(UI.chatDisclaimer)}
          </p>
        </header>

        <div
          ref={log}
          className="flex-1 overflow-y-auto px-8 py-7 flex flex-col gap-6"
          role="log"
          aria-live="polite"
        >
          <p className="t-body">{t(character.greeting)}</p>

          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'self-end max-w-[85%]' : 'max-w-[92%]'}>
              <p className="t-eyebrow mb-2">{m.role === 'user' ? t(UI.you) : character.name}</p>
              <p
                className="text-[0.95rem] leading-relaxed font-light"
                style={{
                  color: m.role === 'user' ? 'rgba(234,234,242,0.72)' : 'var(--bone)',
                  borderLeft: m.role === 'assistant' ? `1px solid ${character.palette[0]}55` : undefined,
                  paddingLeft: m.role === 'assistant' ? '1rem' : undefined,
                }}
              >
                {m.content}
              </p>
            </div>
          ))}

          {busy && (
            <div className="flex items-center gap-2" aria-label={t(UI.thinking)}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-bone/70"
                  style={{ animation: `blink 1.1s ${i * 0.16}s infinite ease-in-out` }}
                />
              ))}
              <style>{`@keyframes blink{0%,100%{opacity:.2}50%{opacity:1}}`}</style>
            </div>
          )}

          {error && <p className="text-[0.8rem] text-[#ff9a8a]">{error}</p>}

          {messages.length === 0 && !busy && (
            <div className="flex flex-wrap gap-2 mt-2">
              {character.suggested.map((q) => (
                <button
                  key={t(q)}
                  onClick={() => ask(t(q))}
                  className="text-[0.68rem] tracking-[0.12em] uppercase border border-[rgba(234,234,242,0.2)] px-3 py-2 hover:border-[rgba(234,234,242,0.6)] transition-colors duration-500"
                  data-cursor="hover"
                >
                  {t(q)}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          className="px-8 pb-8 pt-5 hair-t"
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
          }}
        >
          <div className="flex items-center gap-4">
            <input
              ref={input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t(UI.askAQuestion)}
              maxLength={400}
              className="flex-1 bg-transparent border-b border-[rgba(234,234,242,0.22)] focus:border-bone/70 outline-none py-3 text-[0.95rem] font-light placeholder:text-smoke/50 transition-colors duration-500"
              aria-label={t(UI.yourQuestion)}
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              className="t-eyebrow hover:text-bone transition-colors duration-500 disabled:opacity-30"
              data-cursor="hover"
            >
              {t(UI.send)}
            </button>
          </div>
          <p className="t-eyebrow mt-4 opacity-45">
            {source === 'model'
              ? t(UI.answeredByModel)
              : source === 'mock'
                ? t(UI.answeredByLocal)
                : isTouch
                  ? t(UI.tapToClose)
                  : t(UI.escToClose)}
          </p>
        </form>
      </motion.aside>
    </AnimatePresence>
  );
}
