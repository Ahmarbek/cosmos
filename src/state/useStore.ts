import { create } from 'zustand';

/** The six chapters of the journey, in order. */
export type ChapterId = 'universe' | 'blackholes' | 'solar' | 'earth' | 'icons' | 'world';

export interface Chapter {
  id: ChapterId;
  index: string;
  label: string;
  start: number;
  end: number;
}

export const CHAPTERS: Chapter[] = [
  { id: 'universe', index: '01', label: 'Universe', start: 0.0, end: 0.14 },
  { id: 'blackholes', index: '02', label: 'Black Holes', start: 0.14, end: 0.42 },
  { id: 'solar', index: '03', label: 'Solar System', start: 0.42, end: 0.62 },
  { id: 'earth', index: '04', label: 'Earth', start: 0.62, end: 0.76 },
  { id: 'icons', index: '05', label: 'Icons', start: 0.76, end: 0.94 },
  { id: 'world', index: '06', label: 'Enter World', start: 0.94, end: 1.0 },
];

export function chapterAt(p: number): Chapter {
  for (const c of CHAPTERS) if (p >= c.start && p < c.end) return c;
  return CHAPTERS[CHAPTERS.length - 1];
}

export type Quality = 'low' | 'medium' | 'high';
export type Stage = 'loading' | 'journey' | 'world';
export type Interactive = null | 'blackhole' | 'solar';

interface CosmosState {
  stage: Stage;
  setStage: (s: Stage) => void;
  progress: number;
  rawProgress: number;
  setProgress: (smoothed: number, raw: number) => void;
  velocity: number;
  setVelocity: (v: number) => void;
  interactive: Interactive;
  setInteractive: (i: Interactive) => void;
  selectedPlanet: string | null;
  setSelectedPlanet: (id: string | null) => void;
  openIcon: string | null;
  setOpenIcon: (id: string | null) => void;
  quality: Quality;
  setQuality: (q: Quality) => void;
  webgl: boolean;
  setWebgl: (v: boolean) => void;
  isTouch: boolean;
  setIsTouch: (v: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  sound: boolean;
  toggleSound: () => void;
  worldNear: string | null;
  setWorldNear: (id: string | null) => void;
  chatWith: string | null;
  setChatWith: (id: string | null) => void;
  pointerLocked: boolean;
  setPointerLocked: (v: boolean) => void;
}

export const useStore = create<CosmosState>((set) => ({
  stage: 'loading',
  setStage: (stage) => set({ stage }),
  progress: 0,
  rawProgress: 0,
  setProgress: (progress, rawProgress) => set({ progress, rawProgress }),
  velocity: 0,
  setVelocity: (velocity) => set({ velocity }),
  interactive: null,
  setInteractive: (interactive) => set({ interactive }),
  selectedPlanet: null,
  setSelectedPlanet: (selectedPlanet) => set({ selectedPlanet }),
  openIcon: null,
  setOpenIcon: (openIcon) => set({ openIcon }),
  quality: 'high',
  setQuality: (quality) => set({ quality }),
  webgl: true,
  setWebgl: (webgl) => set({ webgl }),
  isTouch: false,
  setIsTouch: (isTouch) => set({ isTouch }),
  reducedMotion: false,
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  sound: false,
  toggleSound: () => set((s) => ({ sound: !s.sound })),
  worldNear: null,
  setWorldNear: (worldNear) => set({ worldNear }),
  chatWith: null,
  setChatWith: (chatWith) => set({ chatWith }),
  pointerLocked: false,
  setPointerLocked: (pointerLocked) => set({ pointerLocked }),
}));

export const readStore = () => useStore.getState();

// Dev-only handle so the running app can be inspected (and driven) from the
// console or an automation harness. Never present in a production build.
if (import.meta.env.DEV) {
  (window as unknown as { __cosmos?: typeof useStore }).__cosmos = useStore;
}
