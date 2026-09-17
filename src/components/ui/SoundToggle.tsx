import { useEffect, useRef } from 'react';
import { useStore } from '../../state/useStore';
import { useT } from '../../i18n';
import { UI } from '../../i18n/ui';
import { setAudioEnabled, startAudio, updateAudioScene } from '../../lib/audio';

/** Sound is off until asked for. The bars animate only while it is on. */
export default function SoundToggle() {
  const t = useT();
  const sound = useStore((s) => s.sound);
  const toggle = useStore((s) => s.toggleSound);
  const started = useRef(false);

  useEffect(() => {
    if (sound && !started.current) {
      started.current = true;
      void startAudio();
    } else {
      setAudioEnabled(sound);
    }
  }, [sound]);

  useEffect(() => {
    if (!sound) return;
    const id = setInterval(() => updateAudioScene(useStore.getState().progress), 900);
    return () => clearInterval(id);
  }, [sound]);

  return (
    <button
      onClick={toggle}
      className="group flex items-center gap-3 py-2"
      aria-pressed={sound}
      aria-label={t(sound ? UI.turnSoundOff : UI.turnSoundOn)}
      data-cursor="hover"
    >
      <span className="flex items-end gap-[2px] h-3" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-[2px] bg-bone origin-bottom transition-all duration-500"
            style={{
              height: sound ? '100%' : '22%',
              opacity: sound ? 0.9 : 0.4,
              animation: sound ? `eq 1.${4 + i}s ease-in-out ${i * 0.14}s infinite alternate` : 'none',
            }}
          />
        ))}
      </span>
      <span className="t-eyebrow group-hover:text-bone transition-colors duration-500">
        {t(sound ? UI.soundOn : UI.soundOff)}
      </span>
      <style>{`@keyframes eq { from { transform: scaleY(0.28) } to { transform: scaleY(1) } }`}</style>
    </button>
  );
}
