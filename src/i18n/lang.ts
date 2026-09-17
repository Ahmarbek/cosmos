/**
 * Language.
 *
 * Every piece of copy in the project — interface chrome, chapter prose, the
 * planet and black-hole data, the ten profiles, the characters' greetings —
 * is stored as a pair rather than a string, so a missing translation is a type
 * error rather than a sentence that quietly stays in the wrong language.
 *
 * Switching is immediate and does not reload: the journey keeps its scroll
 * position, the camera keeps its place, and the WebGL scene is never rebuilt,
 * because none of it depends on which language the copy is in.
 */
export type Lang = 'en' | 'uz';

/** A string that exists in both languages. */
export interface L {
  readonly en: string;
  readonly uz: string;
}

/**
 * Copy that may legitimately be the same in both languages.
 *
 * A plain string here is a claim, not an oversight: the title of an album, a
 * club, a film or a scientific paper is how a reader searches for it, so those
 * stay in their original form while everything written *about* them is a pair.
 */
export type Text = L | string;

export const LANGS: { id: Lang; short: string; label: string }[] = [
  { id: 'en', short: 'EN', label: 'English' },
  { id: 'uz', short: 'UZ', label: 'Oʻzbekcha' },
];

const STORAGE_KEY = 'cosmos.lang';

const isLang = (v: unknown): v is Lang => v === 'en' || v === 'uz';

/**
 * A returning visitor gets what they chose last time; a new one gets their
 * browser's preference if we speak it, and English otherwise.
 */
export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* private mode, or site data blocked — fall through to the browser */
  }
  try {
    if (navigator.languages?.some((l) => l.toLowerCase().startsWith('uz'))) return 'uz';
  } catch {
    /* no navigator.languages */
  }
  return 'en';
}

export function persistLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* a language that cannot be remembered still works for this visit */
  }
  // Screen readers and the browser's own translation prompt both read this.
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}

/** Resolve a pair against a language. Plain strings pass through untouched. */
export function tr(value: Text, lang: Lang): string {
  return typeof value === 'string' ? value : value[lang];
}
