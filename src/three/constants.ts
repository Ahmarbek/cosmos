import * as THREE from 'three';

/** Landmark positions in world space. The journey is one continuous flight. */
export const BH_POS = new THREE.Vector3(0, 0, -260);
/** One Schwarzschild radius, in world units. */
export const RS_WORLD = 6;
/** Disk extent, in Schwarzschild radii. */
export const DISK_INNER = 2.4;
export const DISK_OUTER = 13.0;
/** Tilt of the accretion disk, so the camera never meets it edge-on. */
export const DISK_NORMAL = new THREE.Vector3(0.34, 1.0, 0.16).normalize();

export const SS_POS = new THREE.Vector3(1500, -150, -2100);
/** Orbital speed multiplier for the visualisation. */
export const ORBIT_SPEED = 0.06;

export const STAR_BOX = 2600;
