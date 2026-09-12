import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ControlState } from './useWorldControls';
import { CHARACTER_BY_ID } from '../data/characters';
import { useStore } from '../state/useStore';
import { blip } from '../lib/audio';

const ease = [0.16, 1, 0.3, 1] as const;

/** Left-hand virtual stick for touch devices. */
function Stick({ controls }: { controls: React.MutableRefObject<ControlState> }) {
  const pad = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const id = useRef<number | null>(null);

  useEffect(() => {
    const el = pad.current;
    if (!el) return;
    const R = 52;

    const set = (dx: number, dy: number) => {
      const d = Math.min(1, Math.hypot(dx, dy) / R);
      const a = Math.atan2(dy, dx);
      const x = Math.cos(a) * d;
      const y = Math.sin(a) * d;
      controls.current.strafe = x;
      controls.current.forward = -y;
      if (knob.current) knob.current.style.transform = `translate(${x * R}px, ${y * R}px)`;
    };
    const reset = () => {
      controls.current.strafe = 0;
      controls.current.forward = 0;
      if (knob.current) knob.current.style.transform = 'translate(0px, 0px)';
    };

    const start = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      id.current = t.identifier;
      const r = el.getBoundingClientRect();
      set(t.clientX - (r.left + r.width / 2), t.clientY - (r.top + r.height / 2));
    };
    const move = (e: TouchEvent) => {
      const r = el.getBoundingClientRect();
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier !== id.current) continue;
        set(t.clientX - (r.left + r.width / 2), t.clientY - (r.top + r.height / 2));
      }
    };
    const end = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === id.current) {
          id.current = null;
          reset();
        }
      }
    };

    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: true });
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', end);
    };
  }, [controls]);

  return (
    <div
      ref={pad}
      className="absolute bottom-[7vh] left-[7vw] w-[120px] h-[120px] rounded-full border border-[rgba(234,234,242,0.2)] grid place-items-center touch-none"
      style={{ background: 'rgba(255,255,255,0.03)' }}
      aria-hidden
    >
      <div
        ref={knob}
        className="w-11 h-11 rounded-full border border-[rgba(234,234,242,0.45)] bg-[rgba(255,255,255,0.07)]"
      />
    </div>
  );
}

const KEYS_DESKTOP: [string, string][] = [
  ['W A S D', 'move'],
  ['Mouse', 'look'],
  ['Shift', 'run'],
  ['Space', 'jump'],
  ['E', 'interact'],
  ['Esc', 'release'],
];
const KEYS_TOUCH: [string, string][] = [
  ['Stick', 'move'],
  ['Drag', 'look'],
  ['Tap', 'interact'],
];

export default function HUD({ controls }: { controls: React.MutableRefObject<ControlState> }) {
  const near = useStore((s) => s.worldNear);
  const chatWith = useStore((s) => s.chatWith);
  const locked = useStore((s) => s.pointerLocked);
  const isTouch = useStore((s) => s.isTouch);
  const setStage = useStore((s) => s.setStage);
  const setChatWith = useStore((s) => s.setChatWith);
  const [briefed, setBriefed] = useState(false);

  const character = near ? CHARACTER_BY_ID[near] : null;

  return (
    <div className="stack pointer-events-none z-[70] select-none">
      {!chatWith && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="rounded-full border border-bone/70 transition-all duration-500"
            style={{ width: near ? 13 : 5, height: near ? 13 : 5, opacity: near ? 0.9 : 0.42 }}
          />
        </div>
      )}

      <AnimatePresence>
        {!briefed && (
          <motion.div
            className="stack grid place-items-center bg-black/80 backdrop-blur-sm pointer-events-auto px-[8vw]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="max-w-[54ch] text-center">
              <p className="t-eyebrow mb-7">The Hall of Icons</p>
              <h2 className="t-display-sm mb-9">Walk it yourself.</h2>
              <div className="flex flex-wrap justify-center gap-x-7 gap-y-4 mb-10">
                {(isTouch ? KEYS_TOUCH : KEYS_DESKTOP).map(([k, v]) => (
                  <span key={k} className="flex items-center gap-2">
                    <kbd className="text-[0.6rem] tracking-[0.18em] uppercase text-bone border border-[rgba(234,234,242,0.24)] px-2 py-1">
                      {k}
                    </kbd>
                    <span className="t-eyebrow">{v}</span>
                  </span>
                ))}
              </div>
              <p className="t-body mb-10 mx-auto max-w-[46ch]">
                The ten figures here are interactive AI characters — simulations built from
                documented public information. They are not the real people, and nothing they
                say is a genuine quotation.
              </p>
              <button
                className="btn-cosmos"
                onClick={() => {
                  blip(760, 0.12, 0.05);
                  setBriefed(true);
                }}
                data-cursor="hover"
                autoFocus
              >
                <span>Begin</span>
                <span aria-hidden>◈</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {briefed && !locked && !chatWith && !isTouch && (
        <div className="absolute left-1/2 bottom-[15vh] -translate-x-1/2">
          <p className="t-eyebrow animate-pulse">Click to take control</p>
        </div>
      )}

      <AnimatePresence>
        {character && !chatWith && (
          <motion.div
            key={character.id}
            // Centred by flex, not by -translate-x-1/2: this element animates y
            // through Motion, and Motion writes the whole transform property,
            // silently dropping a Tailwind translate class alongside it. The
            // block then hangs off the 50% mark instead of straddling it, which
            // a desktop viewport hides and a 375px one clips. inset-x-0 also
            // lets a long name wrap rather than run off the screen.
            className="absolute inset-x-0 bottom-[23vh] px-6 flex flex-col items-center text-center pointer-events-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4, ease }}
          >
            <p className="t-eyebrow mb-3" style={{ color: character.palette[0] }}>
              {character.label}
            </p>
            <p className="font-display text-3xl mb-5">{character.name}</p>
            <button className="btn-cosmos" onClick={() => setChatWith(character.id)} data-cursor="hover">
              <span>{isTouch ? 'Tap to interact' : 'Press E to interact'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!chatWith && (
        <div className="absolute top-[3vh] right-[4vw] pointer-events-auto">
          <button
            className="t-eyebrow hover:text-bone transition-colors duration-500"
            onClick={() => {
              blip(380, 0.12, 0.05);
              setStage('journey');
            }}
            data-cursor="hover"
          >
            ← Return to Cosmos
          </button>
        </div>
      )}

      {!chatWith && (
        <div className="absolute bottom-[4vh] left-[4vw] hidden md:block">
          <p className="t-eyebrow opacity-45">
            {locked ? 'WASD · Shift · Space · E' : 'Paused'}
          </p>
        </div>
      )}

      {isTouch && briefed && !chatWith && (
        <div className="pointer-events-auto">
          <Stick controls={controls} />
        </div>
      )}
    </div>
  );
}
