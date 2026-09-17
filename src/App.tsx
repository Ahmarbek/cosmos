import { Suspense, lazy, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Loader from './components/ui/Loader';
import Cursor from './components/ui/Cursor';
import Nav from './components/ui/Nav';
import Universe from './sections/Universe';
import BlackHoles from './sections/BlackHoles';
import SolarSystemSection from './sections/SolarSystem';
import EarthSection from './sections/EarthSection';
import Humanity from './sections/Humanity';
import IconProfile from './sections/IconProfile';
import EnterWorld from './sections/EnterWorld';
import JourneyCanvas from './three/JourneyCanvas';
import CanvasBoundary from './three/CanvasBoundary';
import Fallback2D from './three/Fallback2D';
import { useCapabilities } from './hooks/useCapabilities';
import { useScrollJourney } from './hooks/useScrollJourney';
import { useStore } from './state/useStore';
import { useLang, useT } from './i18n';
import { UI } from './i18n/ui';

const World = lazy(() => import('./world/World'));

/** Total scroll length of the journey. Long enough to give every beat room. */
const TRACK_VH = 1400;

export default function App() {
  useCapabilities();
  const t = useT();
  const lang = useLang();

  // The tab title, the meta description and the lang attribute are outside the
  // React tree, so they are kept in step by hand rather than left in whichever
  // language the document was served in.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t(UI.title);
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t(UI.description));
  }, [lang, t]);

  const stage = useStore((s) => s.stage);
  const setStage = useStore((s) => s.setStage);
  const quality = useStore((s) => s.quality);
  const webgl = useStore((s) => s.webgl);
  const isTouch = useStore((s) => s.isTouch);
  const interactive = useStore((s) => s.interactive);
  const openIcon = useStore((s) => s.openIcon);

  useScrollJourney(stage === 'journey' && !interactive && !openIcon);

  // Scroll is locked whenever something else has taken the wheel: an inspect
  // mode, a profile, or the world. The position is preserved throughout.
  useEffect(() => {
    // Locked while loading too — otherwise a visitor can scroll behind the
    // loading screen and start the journey already halfway through it.
    const lock = stage !== 'journey' || !!interactive || !!openIcon;
    const prev = document.body.style.overflow;
    document.body.style.overflow = lock ? 'hidden' : '';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [stage, interactive, openIcon]);

  // Escape leaves any inspect mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && useStore.getState().interactive) {
        useStore.getState().setInteractive(null);
        useStore.getState().setSelectedPlanet(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Cursor enabled={!isTouch} />

      <AnimatePresence>
        {stage === 'loading' && <Loader key="loader" onEnter={() => setStage('journey')} />}
      </AnimatePresence>

      {/* the scroll track: empty, and the full length of the journey */}
      <div style={{ height: `${TRACK_VH}vh` }} aria-hidden />

      {/* the fixed stage everything is drawn on */}
      <div className="fixed inset-0 overflow-hidden">
        {stage !== 'world' &&
          (webgl ? (
            <CanvasBoundary fallback={<Fallback2D />}>
              <JourneyCanvas quality={quality} />
            </CanvasBoundary>
          ) : (
            <Fallback2D />
          ))}

        {/* atmosphere over the render, never under it */}
        <div className="stack pointer-events-none vignette grain" />

        {stage !== 'world' && (
          <div className="stack">
            <Universe />
            <BlackHoles />
            <SolarSystemSection />
            <EarthSection />
            <Humanity />
            <EnterWorld />
          </div>
        )}
      </div>

      {stage !== 'world' && <Nav visible={stage === 'journey'} />}
      <IconProfile />

      <AnimatePresence>
        {stage === 'world' && (
          <motion.div
            key="world"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60]"
          >
            <Suspense
              fallback={
                <div className="stack grid place-items-center bg-void">
                  <p className="t-eyebrow animate-pulse">{t(UI.buildingTheHall)}</p>
                </div>
              }
            >
              <World quality={quality} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
