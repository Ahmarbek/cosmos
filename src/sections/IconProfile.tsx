import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Portrait from '../components/ui/Portrait';
import { ICON_BY_ID } from '../data/icons';
import { PHOTO_CREDITS, PHOTO_SOURCE } from '../data/credits';
import { useStore } from '../state/useStore';
import { blip } from '../lib/audio';
import { useT } from '../i18n';
import { UI, FIELD_LABEL } from '../i18n/ui';

const ease = [0.16, 1, 0.3, 1] as const;

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-5 mb-6">
      <span className="t-eyebrow">{children}</span>
      <span className="h-px flex-1 bg-[rgba(234,234,242,0.12)]" />
    </div>
  );
}

/**
 * PROFILE — a full-screen editorial spread.
 *
 * Everything here is documented public record, and nothing is attributed to the
 * person as a quotation.
 */
export default function IconProfile() {
  const openIcon = useStore((s) => s.openIcon);
  const setOpenIcon = useStore((s) => s.setOpenIcon);
  const setStage = useStore((s) => s.setStage);
  const setChatWith = useStore((s) => s.setChatWith);
  const t = useT();
  const icon = openIcon ? ICON_BY_ID[openIcon] : null;

  useEffect(() => {
    if (!icon) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenIcon(null);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [icon, setOpenIcon]);

  if (!icon) return <AnimatePresence />;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] bg-void overflow-y-auto overscroll-contain"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease }}
        role="dialog"
        aria-modal="true"
        aria-label={`${icon.name} profile`}
      >
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background: `radial-gradient(80% 60% at 20% 0%, ${icon.palette[1]}22, transparent 70%)`,
          }}
        />

        <button
          onClick={() => {
            blip(380, 0.1, 0.04);
            setOpenIcon(null);
          }}
          className="fixed top-[3vh] right-[4vw] z-20 t-eyebrow hover:text-bone transition-colors duration-500"
          data-cursor="hover"
        >
          {t(UI.close)} ✕
        </button>

        <div className="relative max-w-[1500px] mx-auto px-[6vw] md:px-[5vw] py-[10vh]">
          <motion.header
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease, delay: 0.1 }}
            className="mb-[7vh]"
          >
            <p className="t-eyebrow mb-8">
              {t(FIELD_LABEL[icon.field])} · {t(icon.origin)}
            </p>
            <h1
              className="font-display leading-[0.86] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(3rem, 10vw, 9rem)' }}
            >
              {icon.name}
            </h1>
            <div className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-3">
              <span className="t-label">{t(icon.discipline)}</span>
              <span className="t-label tabular-nums">
                {icon.born} — {icon.died ?? 'present'}
              </span>
            </div>
          </motion.header>

          <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-[6vw]">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease, delay: 0.2 }}
              className="md:sticky md:top-[8vh] self-start"
            >
              <Portrait icon={icon} active className="w-full aspect-[3/4]" />
              <p className="t-lead mt-7">{t(icon.line)}</p>
              {/* The CC BY-SA images carry an attribution requirement; this is
                  the licence condition, not a courtesy. */}
              {PHOTO_CREDITS[icon.id] ? (
                <p className="mt-6 text-[0.58rem] tracking-[0.18em] uppercase text-smoke/60 leading-relaxed">
                  {t(UI.photograph)}: {PHOTO_CREDITS[icon.id].artist}
                  <br />
                  {PHOTO_CREDITS[icon.id].licence} · {PHOTO_SOURCE}
                </p>
              ) : (
                <p className="mt-6 text-[0.58rem] tracking-[0.2em] uppercase text-smoke/60 leading-relaxed">
                  {t(UI.generativeIllustration)}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease, delay: 0.3 }}
              className="flex flex-col gap-[6vh]"
            >
              <section>
                <SectionTitle>{t(UI.biography)}</SectionTitle>
                <div className="flex flex-col gap-5">
                  {icon.bio.map((b, i) => (
                    <p key={i} className="t-body">
                      {t(b)}
                    </p>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle>{t(UI.culturalImpact)}</SectionTitle>
                <p className="t-lead">{t(icon.impact)}</p>
              </section>

              <section>
                <SectionTitle>{t(UI.achievements)}</SectionTitle>
                <ul className="flex flex-col">
                  {icon.achievements.map((a, i) => (
                    <li key={i} className="hair-t py-4 flex gap-6 items-baseline text-bone/85 font-light">
                      <span className="t-eyebrow tabular-nums shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[0.95rem] leading-relaxed">{t(a)}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <SectionTitle>{t(UI.majorWorks)}</SectionTitle>
                <div className="grid sm:grid-cols-2 gap-x-8">
                  {icon.works.map((w) => (
                    <div key={t(w.title)} className="hair-t py-5">
                      <div className="flex items-baseline justify-between gap-4 mb-2">
                        <h4 className="font-display text-xl leading-tight">{t(w.title)}</h4>
                        <span className="t-eyebrow tabular-nums shrink-0">{w.year}</span>
                      </div>
                      <p className="text-[0.82rem] text-smoke leading-relaxed font-light">{t(w.note)}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle>{t(UI.timeline)}</SectionTitle>
                <ol className="relative pl-7">
                  <span className="absolute left-[3px] top-2 bottom-2 w-px bg-[rgba(234,234,242,0.16)]" />
                  {icon.timeline.map((entry) => (
                    <li key={entry.year + t(entry.event)} className="relative pb-7 last:pb-0">
                      <span
                        className="absolute -left-7 top-[0.45rem] w-[7px] h-[7px] rounded-full"
                        style={{ background: icon.palette[0] }}
                      />
                      <p className="t-eyebrow tabular-nums mb-1">{entry.year}</p>
                      <p className="text-[0.92rem] text-bone/85 font-light leading-relaxed">{t(entry.event)}</p>
                    </li>
                  ))}
                </ol>
              </section>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  className="btn-cosmos"
                  data-cursor="hover"
                  onClick={() => {
                    blip(820, 0.12, 0.05);
                    setOpenIcon(null);
                    setChatWith(icon.id);
                    setStage('world');
                  }}
                >
                  <span>{t(UI.meetInWorld)}</span>
                  <span aria-hidden>&rarr;</span>
                </button>
                <button className="btn-cosmos btn-ghost" data-cursor="hover" onClick={() => setOpenIcon(null)}>
                  <span>{t(UI.backToIcons)}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
