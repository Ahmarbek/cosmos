import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ARENA_RADIUS, EYE_HEIGHT, INTERACT_RANGE, STATIONS } from './worldLayout';
import type { ControlState } from './useWorldControls';
import { readStore, useStore } from '../state/useStore';
import { damp } from '../utils/math';

const WALK = 5.6;
const RUN = 9.4;
const ACCEL = 12;
const GRAVITY = 22;
const JUMP = 7.2;
const PLINTH_BLOCK = 1.9;

/**
 * First-person controller.
 *
 * Pointer lock on desktop, a virtual stick on touch. Movement accelerates
 * rather than snapping, the camera carries a small step bob, and collision is
 * resolved against the arena wall and the ten plinths — enough to make the
 * space feel solid without putting a physics engine in the bundle.
 */
export default function Player({ controls }: { controls: React.MutableRefObject<ControlState> }) {
  const { camera, gl } = useThree();
  // start facing the centre of the rotunda, not the wall behind it
  const yaw = useRef(0);
  const pitch = useRef(-0.02);
  const pos = useRef(new THREE.Vector3(0, EYE_HEIGHT, 14));
  const vel = useRef(new THREE.Vector3());
  const vy = useRef(0);
  const grounded = useRef(true);
  const bob = useRef(0);
  const setPointerLocked = useStore((s) => s.setPointerLocked);
  const setWorldNear = useStore((s) => s.setWorldNear);
  const setChatWith = useStore((s) => s.setChatWith);

  useEffect(() => {
    const el = gl.domElement;
    const request = () => {
      const s = readStore();
      if (s.chatWith || s.isTouch) return;
      el.requestPointerLock?.();
    };
    const onLockChange = () => setPointerLocked(document.pointerLockElement === el);
    const onMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== el) return;
      yaw.current -= e.movementX * 0.0022;
      pitch.current = THREE.MathUtils.clamp(pitch.current - e.movementY * 0.0022, -1.2, 1.2);
    };
    el.addEventListener('click', request);
    document.addEventListener('pointerlockchange', onLockChange);
    document.addEventListener('mousemove', onMove);
    return () => {
      el.removeEventListener('click', request);
      document.removeEventListener('pointerlockchange', onLockChange);
      document.removeEventListener('mousemove', onMove);
      if (document.pointerLockElement === el) document.exitPointerLock?.();
    };
  }, [gl, setPointerLocked]);

  // touch look: drag anywhere outside the movement stick
  useEffect(() => {
    if (!readStore().isTouch) return;
    const el = gl.domElement;
    let id: number | null = null;
    let lx = 0;
    let ly = 0;
    const start = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (t.clientX < window.innerWidth * 0.38 && t.clientY > window.innerHeight * 0.5) return;
      id = t.identifier;
      lx = t.clientX;
      ly = t.clientY;
    };
    const move = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier !== id) continue;
        yaw.current -= (t.clientX - lx) * 0.005;
        pitch.current = THREE.MathUtils.clamp(pitch.current - (t.clientY - ly) * 0.005, -1.1, 1.1);
        lx = t.clientX;
        ly = t.clientY;
      }
    };
    const end = () => {
      id = null;
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: true });
    el.addEventListener('touchend', end);
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
    };
  }, [gl]);

  const wish = useRef(new THREE.Vector3());
  const next = useRef(new THREE.Vector3());

  // dev-only teleport, so the hall can be inspected without walking it
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as Record<string, unknown>;
    w.__tp = (x: number, z: number, y = 0) => {
      pos.current.set(x, EYE_HEIGHT, z);
      yaw.current = y;
      vel.current.set(0, 0, 0);
      return [x, z, y];
    };
    return () => {
      delete w.__tp;
    };
  }, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = readStore();
    const c = controls.current;
    const frozen = !!s.chatWith;

    if (!frozen) {
      yaw.current -= c.lookX;
      pitch.current = THREE.MathUtils.clamp(pitch.current - c.lookY, -1.2, 1.2);
    }
    c.lookX = 0;
    c.lookY = 0;

    // camera looks down -Z, so forward and right follow from the yaw directly
    const sy = Math.sin(yaw.current);
    const cy = Math.cos(yaw.current);
    const fx = -sy;
    const fz = -cy;
    const rx = cy;
    const rz = -sy;

    const speed = c.run ? RUN : WALK;
    wish.current.set(0, 0, 0);
    if (!frozen && (c.forward || c.strafe)) {
      wish.current
        .set(fx * c.forward + rx * c.strafe, 0, fz * c.forward + rz * c.strafe)
        .normalize()
        .multiplyScalar(speed);
    }

    vel.current.x = damp(vel.current.x, wish.current.x, ACCEL, dt);
    vel.current.z = damp(vel.current.z, wish.current.z, ACCEL, dt);

    if (!frozen && c.jump && grounded.current) {
      vy.current = JUMP;
      grounded.current = false;
    }
    vy.current -= GRAVITY * dt;

    const n = next.current.copy(pos.current);
    n.x += vel.current.x * dt;
    n.z += vel.current.z * dt;
    n.y += vy.current * dt;

    if (n.y <= EYE_HEIGHT) {
      n.y = EYE_HEIGHT;
      vy.current = 0;
      grounded.current = true;
    }

    const radial = Math.hypot(n.x, n.z);
    if (radial > ARENA_RADIUS - 1.2) {
      const k = (ARENA_RADIUS - 1.2) / radial;
      n.x *= k;
      n.z *= k;
      vel.current.multiplyScalar(0.4);
    }

    for (const st of STATIONS) {
      const dx = n.x - st.position.x;
      const dz = n.z - st.position.z;
      const d = Math.hypot(dx, dz);
      if (d < PLINTH_BLOCK && d > 0.0001) {
        const push = PLINTH_BLOCK / d;
        n.x = st.position.x + dx * push;
        n.z = st.position.z + dz * push;
      }
    }

    pos.current.copy(n);

    const moving = Math.hypot(vel.current.x, vel.current.z);
    bob.current += dt * moving * 1.5;
    const amp = Math.min(moving / RUN, 1);
    const bobY = grounded.current ? Math.sin(bob.current * 2.2) * amp * 0.045 : 0;
    const bobRoll = Math.cos(bob.current * 1.1) * amp * 0.006;

    camera.position.set(pos.current.x, pos.current.y + bobY, pos.current.z);
    camera.rotation.set(0, 0, 0);
    camera.rotateY(yaw.current);
    camera.rotateX(pitch.current);
    camera.rotateZ(bobRoll);

    let near: string | null = null;
    let best = INTERACT_RANGE;
    for (const st of STATIONS) {
      const d = Math.hypot(pos.current.x - st.position.x, pos.current.z - st.position.z);
      if (d < best) {
        best = d;
        near = st.id;
      }
    }
    if (near !== s.worldNear) setWorldNear(near);

    if (c.interact) {
      c.interact = false;
      if (near && !s.chatWith) setChatWith(near);
    }
  });

  return null;
}
