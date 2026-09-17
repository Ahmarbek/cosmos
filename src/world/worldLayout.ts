import * as THREE from 'three';
import { CHARACTERS } from '../data/characters';
import { tr } from '../i18n/lang';

/** Geometry of the hall, shared by the environment, the player and the HUD. */
export const ARENA_RADIUS = 46;
export const PLINTH_RADIUS = 34;
export const EYE_HEIGHT = 1.68;
export const INTERACT_RANGE = 5.2;

export interface Station {
  id: string;
  name: string;
  discipline: import('../i18n').L;
  angle: number;
  position: THREE.Vector3;
  /**
   * Y rotation that turns the alcove inward.
   *
   * A plane's normal is +Z locally, so this has to resolve to -(cos a, sin a)
   * in world terms — otherwise every name plate faces the wall behind it and,
   * being single-sided, disappears from the hall entirely.
   */
  facing: number;
  palette: [string, string];
}

export const STATIONS: Station[] = CHARACTERS.map((c, i) => {
  const angle = (i / CHARACTERS.length) * Math.PI * 2;
  return {
    id: c.id,
    name: c.name,
    // Positions never change with language; the plate copy is a pair, and the
    // canvas that bakes it re-bakes when the language does.
    discipline: { en: tr(c.description, 'en').split('—')[0].trim(), uz: tr(c.description, 'uz').split('—')[0].trim() },
    angle,
    position: new THREE.Vector3(Math.cos(angle) * PLINTH_RADIUS, 0, Math.sin(angle) * PLINTH_RADIUS),
    facing: -angle - Math.PI / 2,
    palette: c.palette,
  };
});
