import { useCallback } from 'react';
import { useStore } from '../state/useStore';
import { tr, type Lang, type Text } from './lang';

/**
 * The React-facing half of the language layer.
 *
 * It is a separate module from lang.ts on purpose. The chat API runs in Node —
 * the dev server mounts it, and the Vite config imports it at configuration
 * time — so anything it can reach must not drag in the React store, whose
 * module body touches import.meta.env and is undefined outside a bundle. The
 * data files and the retrieval engine therefore import from ./lang, and only
 * components import from here.
 */
export * from './lang';

/** The current language, subscribed — the component re-renders when it changes. */
export function useLang(): Lang {
  return useStore((s) => s.lang);
}

/** A translator bound to the current language. */
export function useT() {
  const lang = useLang();
  return useCallback((value: Text) => tr(value, lang), [lang]);
}

/**
 * The same thing outside React — for the retrieval engine and the canvas-baked
 * labels in the world, neither of which sits in the render tree.
 */
export function readT() {
  const lang = useStore.getState().lang;
  return (value: Text) => tr(value, lang);
}
