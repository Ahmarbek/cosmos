import * as THREE from 'three';
import { SS_POS } from './constants';
import { PLANET_BY_ID } from '../data/planets';

/**
 * Live world position of Earth, written by the solar-system scene and read by
 * the camera path. A shared vector rather than React state: this changes every
 * frame and must never trigger a render.
 */
export const earthWorldPos = new THREE.Vector3(
  SS_POS.x + PLANET_BY_ID.earth.orbit,
  SS_POS.y,
  SS_POS.z
);

/** Live world positions of every planet, for HTML labels and camera focus. */
export const planetWorldPos: Record<string, THREE.Vector3> = {};
