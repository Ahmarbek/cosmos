import * as THREE from 'three';
import { BH_POS, SS_POS } from './constants';
import { clamp, easeIn, easeInOut, easeOut, lerp, range, smoothstep } from '../utils/math';

export interface CamState {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
  /** extra roll in radians — used sparingly, at the two big accelerations */
  roll: number;
}

const _p = new THREE.Vector3();
const _l = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

/**
 * A viewpoint on the sunlit side of a body, `swing` radians off the line to the
 * Sun. Framing against the light instead of against world axes keeps the
 * terminator where it belongs no matter where the planet is in its orbit.
 */
function sunward(
  out: THREE.Vector3,
  bodyPos: THREE.Vector3,
  r: number,
  swing: number,
  el: number
) {
  const dx = SS_POS.x - bodyPos.x;
  const dz = SS_POS.z - bodyPos.z;
  const len = Math.hypot(dx, dz) || 1;
  const ux = dx / len;
  const uz = dz / len;
  const cs = Math.cos(swing);
  const sn = Math.sin(swing);
  const e = el * Math.PI;
  const flat = Math.cos(e) * r;
  return out.set(
    bodyPos.x + (ux * cs - uz * sn) * flat,
    bodyPos.y + Math.sin(e) * r,
    bodyPos.z + (ux * sn + uz * cs) * flat
  );
}

/** Point on a sphere around `c`: azimuth in turns, elevation in turns. */
function orbitPoint(out: THREE.Vector3, c: THREE.Vector3, r: number, az: number, el: number) {
  const a = az * Math.PI * 2;
  const e = el * Math.PI; // 0 = equator-ish, 0.5 = straight above
  return out.set(
    c.x + Math.cos(a) * Math.cos(e) * r,
    c.y + Math.sin(e) * r,
    c.z + Math.sin(a) * Math.cos(e) * r
  );
}

/**
 * The whole camera choreography as a pure function of journey progress.
 *
 * Every chapter writes into the same two vectors; the Rig damps toward them, so
 * the seams between chapters are smoothed by the damping rather than by
 * hand-built crossfades.
 *
 * `earthPos` is passed in because Earth is a moving body inside the solar
 * system scene — the camera targets wherever it actually is this frame.
 */
export function cameraPath(p: number, earthPos: THREE.Vector3, out: CamState): CamState {
  const pos = out.pos;
  const look = out.look;
  let fov = 55;
  let roll = 0;

  if (p < 0.14) {
    // ── 01 UNIVERSE ── a slow forward drift, from stillness into motion
    const t = range(p, 0, 0.14);
    const z = lerp(150, -30, easeIn(t));
    pos.set(Math.sin(t * 3.1) * 5, Math.cos(t * 2.3) * 3, z);
    look.set(pos.x * 0.4, pos.y * 0.4, z - 120);
    fov = lerp(62, 54, easeInOut(t));
  } else if (p < 0.42) {
    // ── 02 BLACK HOLES ── fall toward it, then circle the shadow
    const t = range(p, 0.14, 0.42);
    const approach = easeInOut(clamp(t / 0.62));
    const r = lerp(520, 220, approach);
    const az = lerp(0.26, 0.62, easeInOut(t));
    const el = lerp(0.015, 0.075, smoothstep(0.15, 0.8, t)) + Math.sin(t * 6.0) * 0.006;
    orbitPoint(pos, BH_POS, r, az, el);
    look.copy(BH_POS);
    fov = lerp(58, 44, approach);
    roll = Math.sin(t * 2.4) * 0.035;
  } else if (p < 0.62) {
    // ── 03 SOLAR SYSTEM ── break orbit, fall back, run for home
    const t = range(p, 0.42, 0.62);
    const escape = easeIn(clamp(t / 0.42));

    // where the black-hole orbit would have continued, pulling away fast
    orbitPoint(_a, BH_POS, lerp(220, 2600, escape), 0.62 + t * 0.1, 0.075);

    // the approach into the solar system, high and wide, settling to the ecliptic
    const u = smoothstep(0.22, 1.0, t);
    const r = lerp(1300, 330, easeOut(u));
    const az = lerp(0.08, 0.30, easeInOut(u));
    // drop from a plan view onto the ecliptic: the flatness of the system is
    // the point, and it only reads from a low angle
    const el = lerp(0.28, 0.045, easeInOut(u));
    orbitPoint(_b, SS_POS, r, az, el);

    const blend = smoothstep(0.04, 0.46, t);
    pos.lerpVectors(_a, _b, blend);
    _l.copy(BH_POS).lerp(SS_POS, smoothstep(0.0, 0.34, t));
    look.copy(_l);
    fov = lerp(44, 82, Math.sin(clamp(t / 0.42) * Math.PI) * 0.85) + lerp(0, -6, u);
    roll = Math.sin(t * 3.0) * 0.05 * (1 - u);
  } else if (p < 0.78) {
    // ── 04 EARTH ── leave the system view and close on one planet
    const t = range(p, 0.62, 0.78);
    const u = easeInOut(t);

    orbitPoint(_a, SS_POS, 330, 0.30, 0.045);

    // The approach is framed against the light rather than against fixed world
    // axes: stand on the sunward side of Earth, swung far enough round that the
    // terminator crosses the disc and the Sun itself stays behind the lens.
    // Stay inside Earth's orbital radius. Further out than the Sun is and the
    // approach flies straight past it, putting the star in frame behind the
    // planet instead of behind the lens.
    const r = lerp(62, 16.5, u);
    const swing = lerp(0.62, 1.05, u); // radians off the Earth-Sun line
    sunward(_b, earthPos, r, swing, lerp(0.10, 0.035, u));

    pos.lerpVectors(_a, _b, smoothstep(0.0, 0.46, t));
    _l.copy(SS_POS).lerp(earthPos, smoothstep(0.0, 0.3, t));
    look.copy(_l);
    fov = lerp(56, 48, u);
  } else {
    // ── 05/06 ICONS → WORLD ── Earth settles into the corner of frame, then night
    const t = range(p, 0.78, 1.0);
    const u = easeInOut(clamp(t / 0.62));
    // Earth withdraws to become a backdrop rather than a subject — the icons
    // gallery is the foreground now, and it needs a quiet field behind it.
    const r = lerp(17, 46, u);
    // the swing is capped: any further round and the Sun swings into frame
    sunward(pos, earthPos, r, 1.05 + t * 0.18, lerp(0.035, 0.075, u));
    _l.copy(earthPos);
    // drift the framing so the planet sits low and left, clear of the rail
    _up.set(0, 1, 0);
    _a.subVectors(pos, earthPos).normalize().cross(_up).normalize();
    _l.addScaledVector(_a, lerp(0, 30, u));
    _l.y += lerp(0, 11, u);
    look.copy(_l);
    fov = lerp(48, 54, u);
  }

  out.fov = fov;
  out.roll = roll;
  return out;
}

export function makeCamState(): CamState {
  return { pos: _p.clone(), look: _l.clone(), fov: 55, roll: 0 };
}
