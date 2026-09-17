import { LANGS, useLang } from '../../i18n';
import { useStore } from '../../state/useStore';
import { blip } from '../../lib/audio';

/**
 * Language, in the same register as the sound switch beside it.
 *
 * Two codes rather than a dropdown: with exactly two languages a menu is a
 * click more than the thing is worth, and the inactive code doubles as the
 * label for what pressing it will do. The choice is remembered, so it is a
 * decision a visitor makes once.
 *
 * Switching costs nothing but a re-render — the scene, the camera and the
 * scroll position are all untouched, because none of them knows what language
 * the copy is in.
 */
export default function LanguageToggle() {
  const lang = useLang();
  const setLang = useStore((s) => s.setLang);

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Language">
      {LANGS.map((l, i) => {
        const on = l.id === lang;
        return (
          <span key={l.id} className="flex items-center gap-2">
            {i > 0 && <span className="text-[0.6rem] text-smoke/40" aria-hidden>·</span>}
            <button
              onClick={() => {
                if (on) return;
                blip(on ? 420 : 700, 0.08, 0.04);
                setLang(l.id);
              }}
              className="text-[0.6rem] tracking-[0.22em] uppercase transition-colors duration-500"
              style={{ color: on ? 'var(--bone)' : 'var(--ash)' }}
              aria-pressed={on}
              // the full name for a screen reader; the code is for the eye
              aria-label={l.label}
              lang={l.id}
              data-cursor="hover"
            >
              {l.short}
            </button>
          </span>
        );
      })}
    </div>
  );
}
