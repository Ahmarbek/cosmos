import { useEffect, useRef } from 'react';

/**
 * A dot that tracks the pointer exactly and a ring that follows with weight.
 * The ring opens over anything interactive. Precise pointers only — it is
 * disabled outright on touch, where a custom cursor is noise.
 *
 * Two details keep it off the frame budget. The difference blend sits on the
 * two small elements rather than on the full-screen wrapper, so the compositor
 * blends roughly a thousand pixels against the WebGL canvas each frame instead
 * of the entire viewport. And the loop parks itself once the ring has caught
 * up with the pointer: a cursor that is not moving has no reason to hold a
 * frame callback open behind a scene that needs every one of them.
 */
export default function Cursor({ enabled }: { enabled: boolean }) {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('cursor-custom');

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    let hover = 0;
    let hoverTarget = 0;
    let down = 0;
    let raf = 0;
    let visible = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      visible = 1;
      const el = e.target as HTMLElement | null;
      hoverTarget = el?.closest(
        'a,button,[data-cursor="hover"],input,textarea,[role="button"]'
      )
        ? 1
        : 0;
      wake();
    };
    const onDown = () => {
      down = 1;
      wake();
    };
    const onUp = () => {
      down = 0;
      wake();
    };
    const onLeave = () => {
      visible = 0;
      wake();
    };

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      hover += (hoverTarget - hover) * 0.14;
      const scale = 1 + hover * 1.5 - down * 0.25;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%,-50%) scale(${1 - hover * 0.5})`;
        dot.current.style.opacity = String(visible);
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%,-50%) scale(${scale})`;
        ring.current.style.opacity = String(visible * (0.34 + hover * 0.5));
      }
      const settled =
        Math.abs(pos.x - ringPos.x) < 0.1 &&
        Math.abs(pos.y - ringPos.y) < 0.1 &&
        Math.abs(hoverTarget - hover) < 0.002;
      if (settled) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    wake();

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.addEventListener('pointerleave', onLeave);
    return () => {
      document.documentElement.classList.remove('cursor-custom');
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200]">
      <div
        ref={dot}
        className="fixed top-0 left-0 w-[5px] h-[5px] rounded-full bg-white will-change-transform mix-blend-difference"
      />
      <div
        ref={ring}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white will-change-transform mix-blend-difference"
      />
    </div>
  );
}
