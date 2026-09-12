import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { cameraPath, makeCamState } from './cameraPath';
import { BH_POS, RS_WORLD, SS_POS } from './constants';
import { earthWorldPos, planetWorldPos } from './shared';
import { PLANET_BY_ID } from '../data/planets';
import { readStore, useStore } from '../state/useStore';
import { clamp, damp } from '../utils/math';

/**
 * The camera.
 *
 * Two sources of truth, blended: the scripted path (a pure function of scroll
 * progress) and a manual orbit the visitor takes over when they enter an
 * inspect mode. The blend value is damped, so handing control back and forth
 * never cuts — the camera drifts out of your hands and back into the story.
 */
export default function Rig() {
  const { camera, gl } = useThree();
  const cam = camera as THREE.PerspectiveCamera;

  const target = useMemo(makeCamState, []);
  const cur = useMemo(
    () => ({
      pos: new THREE.Vector3(0, 0, 150),
      look: new THREE.Vector3(0, 0, 0),
      fov: 62,
      roll: 0,
      manual: 0,
    }),
    []
  );

  // manual orbit state
  const orb = useRef({
    az: 0.6,
    el: 0.08,
    r: 110,
    center: new THREE.Vector3(),
    dragging: false,
    lastX: 0,
    lastY: 0,
    pinch: 0,
  });

  const interactive = useStore((s) => s.interactive);
  const selectedPlanet = useStore((s) => s.selectedPlanet);

  // ── entering / leaving an inspect mode ────────────────────────────────────
  useEffect(() => {
    const o = orb.current;
    if (!interactive) return;
    const center = interactive === 'blackhole' ? BH_POS : SS_POS;
    o.center.copy(center);
    const rel = new THREE.Vector3().subVectors(cam.position, center);
    o.r = rel.length();
    o.el = Math.asin(clamp(rel.y / Math.max(o.r, 0.001), -1, 1)) / Math.PI;
    o.az = Math.atan2(rel.z, rel.x) / (Math.PI * 2);
  }, [interactive, cam]);

  // ── pointer control, only while an inspect mode is active ─────────────────
  useEffect(() => {
    const el = gl.domElement;
    const o = orb.current;

    const minR = () => (readStore().interactive === 'blackhole' ? RS_WORLD * 7 : 90);
    const maxR = () => (readStore().interactive === 'blackhole' ? RS_WORLD * 62 : 1400);

    const down = (e: PointerEvent) => {
      if (!readStore().interactive) return;
      o.dragging = true;
      o.lastX = e.clientX;
      o.lastY = e.clientY;
      el.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!o.dragging || !readStore().interactive) return;
      const dx = e.clientX - o.lastX;
      const dy = e.clientY - o.lastY;
      o.lastX = e.clientX;
      o.lastY = e.clientY;
      o.az -= dx * 0.0011;
      o.el = clamp(o.el + dy * 0.0011, -0.24, 0.24);
    };
    const up = (e: PointerEvent) => {
      o.dragging = false;
      el.releasePointerCapture?.(e.pointerId);
    };
    const wheel = (e: WheelEvent) => {
      if (!readStore().interactive) return;
      e.preventDefault();
      o.r = clamp(o.r * (1 + Math.sign(e.deltaY) * 0.09), minR(), maxR());
    };
    const touchMove = (e: TouchEvent) => {
      if (!readStore().interactive || e.touches.length !== 2) return;
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (o.pinch) o.r = clamp(o.r * (o.pinch / d), minR(), maxR());
      o.pinch = d;
    };
    const touchEnd = () => {
      o.pinch = 0;
    };

    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    el.addEventListener('wheel', wheel, { passive: false });
    el.addEventListener('touchmove', touchMove, { passive: true });
    el.addEventListener('touchend', touchEnd);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      el.removeEventListener('wheel', wheel);
      el.removeEventListener('touchmove', touchMove);
      el.removeEventListener('touchend', touchEnd);
    };
  }, [gl]);

  const orbitPos = useMemo(() => new THREE.Vector3(), []);
  const focusCenter = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = readStore();

    cameraPath(s.progress, earthWorldPos, target);

    const o = orb.current;
    const manualTarget = s.interactive ? 1 : 0;
    cur.manual = damp(cur.manual, manualTarget, 3.2, dt);

    if (cur.manual > 0.001) {
      // drift while idle, so an untouched inspect view is never static
      if (!o.dragging) o.az += dt * 0.006;

      focusCenter.copy(o.center);
      let radius = o.r;
      if (s.interactive === 'solar' && selectedPlanet) {
        const wp = planetWorldPos[selectedPlanet];
        const def = PLANET_BY_ID[selectedPlanet];
        if (wp && def) {
          focusCenter.copy(wp);
          radius = Math.max(def.radius * 6.5, 14);
        }
      }

      const a = o.az * Math.PI * 2;
      const e = o.el * Math.PI;
      orbitPos.set(
        focusCenter.x + Math.cos(a) * Math.cos(e) * radius,
        focusCenter.y + Math.sin(e) * radius,
        focusCenter.z + Math.sin(a) * Math.cos(e) * radius
      );

      target.pos.lerp(orbitPos, cur.manual);
      target.look.lerp(focusCenter, cur.manual);
      target.roll *= 1 - cur.manual;
    }

    const lambda = s.reducedMotion ? 9 : 4.2;
    cur.pos.x = damp(cur.pos.x, target.pos.x, lambda, dt);
    cur.pos.y = damp(cur.pos.y, target.pos.y, lambda, dt);
    cur.pos.z = damp(cur.pos.z, target.pos.z, lambda, dt);
    cur.look.x = damp(cur.look.x, target.look.x, lambda * 1.25, dt);
    cur.look.y = damp(cur.look.y, target.look.y, lambda * 1.25, dt);
    cur.look.z = damp(cur.look.z, target.look.z, lambda * 1.25, dt);
    cur.fov = damp(cur.fov, target.fov, 3, dt);
    cur.roll = damp(cur.roll, target.roll, 2.5, dt);

    cam.position.copy(cur.pos);
    cam.up.set(0, 1, 0);
    cam.lookAt(cur.look);
    if (Math.abs(cur.roll) > 0.0005) cam.rotateZ(cur.roll);
    if (Math.abs(cam.fov - cur.fov) > 0.01) {
      cam.fov = cur.fov;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
