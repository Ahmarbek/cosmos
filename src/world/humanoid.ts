import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Procedural figures for the hall.
 *
 * These are people, not portraits. An exact likeness of a real person comes
 * from a photogrammetry scan or a character artist; it cannot be written. What
 * can be written is everything else that makes someone recognisable at a
 * glance — height, build, posture, hair, and above all the clothes they are
 * remembered in. A footballer in a kit with a ball at his feet reads as that
 * footballer from across a room; a generic mannequin with his face badly
 * approximated does not.
 *
 * If a real model is supplied at /models/<id>.glb the world loads that instead
 * and none of this runs. See Avatar.tsx.
 *
 * Everything is built from primitives, painted per body part with a vertex
 * colour, and merged into one BufferGeometry — ten figures, ten draw calls.
 */

export type Build = 'slim' | 'athletic' | 'heavy';

export interface HumanoidParams {
  /** overall height in world units */
  height: number;
  build: Build;
  /** shoulder width multiplier */
  shoulders: number;
  /** 0 = arms at sides, 1 = arms well clear of the body */
  armSpread: number;
  /** additive mass on the skull, for period hair */
  hair: number;
  /** long coat or dress: flares the lower body into a skirt */
  robe: number;
  prop: Prop;
  palette: Wardrobe;
}

/** What the figure is wearing. The single strongest identity signal there is. */
export interface Wardrobe {
  skin: string;
  hair: string;
  /** shirt, jacket, or bare torso */
  top: string;
  /** trousers, shorts, or skirt */
  bottom: string;
  shoes: string;
  /** gloves, hat, ball, cane */
  accent: string;
  /** true when the arms are bare — vests, boxing, short sleeves */
  bareArms?: boolean;
  /** true when the legs are bare below the shorts */
  bareLegs?: boolean;
}

export type Prop =
  | 'none'
  | 'fedora'
  | 'bowler'
  | 'football'
  | 'gloves'
  | 'beard'
  | 'device'
  | 'coil';

const BUILDS: Record<Build, { limb: number; torso: number }> = {
  slim: { limb: 0.85, torso: 0.9 },
  athletic: { limb: 1.0, torso: 1.05 },
  heavy: { limb: 1.15, torso: 1.2 },
};

/** Capsule between two points, in the figure's local space. */
function bone(
  from: THREE.Vector3,
  to: THREE.Vector3,
  radius: number,
  segments: number
): THREE.BufferGeometry {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = Math.max(dir.length() - radius * 2, 0.01);
  const g = new THREE.CapsuleGeometry(radius, len, 3, segments);
  // capsules are built along +Y; rotate that axis onto the bone direction
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  g.applyQuaternion(q);
  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  g.translate(mid.x, mid.y, mid.z);
  return g;
}

/** Tags a part with a flat vertex colour so one merged mesh can be many materials. */
function paint(g: THREE.BufferGeometry, hex: string) {
  const c = new THREE.Color(hex);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

/**
 * The skull, as fractions of total height. The face decal has to ride this
 * exact surface, so both it and the head primitive read the numbers from here
 * rather than each repeating them.
 */
export const SKULL = {
  y: 0.925,
  z: 0.002,
  r: 0.07,
  scale: [0.92, 1.12, 1.0] as [number, number, number],
};

function ball(x: number, y: number, z: number, r: number, seg: number, scale?: [number, number, number]) {
  const g = new THREE.SphereGeometry(r, seg, Math.max(4, seg / 2));
  if (scale) g.scale(scale[0], scale[1], scale[2]);
  g.translate(x, y, z);
  return g;
}

/**
 * Builds one figure. Proportions follow a roughly seven-and-a-half-head canon,
 * which is what makes a stack of primitives read as a person rather than as a
 * snowman.
 */
export function buildHumanoid(
  p: HumanoidParams,
  quality: 'low' | 'medium' | 'high',
  opts: { plainFace?: boolean } = {}
): THREE.BufferGeometry {
  const seg = quality === 'low' ? 6 : quality === 'medium' ? 10 : 14;
  const b = BUILDS[p.build];
  const H = p.height;
  const w = p.palette;
  const parts: THREE.BufferGeometry[] = [];
  const put = (g: THREE.BufferGeometry, hex: string) => parts.push(paint(g, hex));

  // vertical landmarks, as fractions of total height
  const yFoot = 0.028 * H;
  const yAnkle = 0.052 * H;
  const yKnee = 0.28 * H;
  const yHip = 0.52 * H;
  const yWaist = 0.6 * H;
  const yChest = 0.72 * H;
  const yShoulder = 0.81 * H;
  const yNeck = 0.855 * H;
  const yHead = SKULL.y * H;

  const hipX = 0.076 * H;
  const shX = 0.128 * H * p.shoulders;
  const limb = b.limb;
  const legTop = w.bareLegs ? w.skin : w.bottom;
  const legLow = w.bareLegs ? w.skin : w.bottom;
  const armCol = w.bareArms ? w.skin : w.top;

  // ── legs ──
  for (const s of [-1, 1]) {
    put(bone(new THREE.Vector3(s * hipX, yHip, 0), new THREE.Vector3(s * hipX * 0.92, yKnee, 0), 0.053 * H * limb, seg), legTop);
    put(bone(new THREE.Vector3(s * hipX * 0.92, yKnee, 0), new THREE.Vector3(s * hipX * 0.88, yAnkle, 0), 0.041 * H * limb, seg), legLow);
    const f = new THREE.BoxGeometry(0.062 * H, 0.048 * H, 0.115 * H);
    f.translate(s * hipX * 0.88, yFoot, 0.022 * H);
    put(f, w.shoes);
  }

  // shorts, for the figures whose legs are bare
  if (w.bareLegs) {
    const shorts = new THREE.CylinderGeometry(0.115 * H * b.torso, 0.14 * H * b.torso, 0.17 * H, seg * 2, 1, false);
    shorts.translate(0, yHip + 0.035 * H, 0);
    put(shorts, w.bottom);
  }

  // ── pelvis and torso ──
  put(ball(0, yHip + 0.02 * H, 0, 0.098 * H * b.torso, seg, [1.25, 0.85, 0.9]), w.bareLegs ? w.bottom : w.bottom);
  put(bone(new THREE.Vector3(0, yWaist, 0), new THREE.Vector3(0, yChest, 0), 0.104 * H * b.torso, seg), w.top);
  put(ball(0, yChest + 0.015 * H, 0, 0.112 * H * b.torso, seg, [1.32, 0.94, 0.76]), w.top);
  put(ball(0, yShoulder, 0, 0.075 * H, seg, [shX / (0.075 * H), 0.6, 0.92]), w.top);

  // ── head ──
  put(bone(new THREE.Vector3(0, yNeck - 0.02 * H, 0), new THREE.Vector3(0, yNeck + 0.02 * H, 0), 0.036 * H, seg), w.skin);
  put(ball(0, yHead, SKULL.z * H, SKULL.r * H, seg, SKULL.scale), w.skin);
  // Eyes, but only when nothing better is going on the skull. Two dark marks
  // are the whole difference between a mannequin and a person facing you, and
  // they are the right answer for a figure with no photograph behind it. When
  // a face decal is worn they would show through the cheekbones, so skip them.
  if (!opts.plainFace) {
    for (const sx of [-1, 1]) {
      // sized to be legible across the hall rather than anatomically; at true
      // scale two dark marks this small vanish beyond a couple of metres
      const eye = new THREE.SphereGeometry(0.02 * H, seg, seg);
      eye.scale(1, 1.1, 0.55);
      eye.translate(sx * 0.028 * H, yHead + 0.006 * H, 0.064 * H);
      put(eye, '#17130f');
    }
    const brow = new THREE.BoxGeometry(0.094 * H, 0.011 * H, 0.014 * H);
    brow.translate(0, yHead + 0.032 * H, 0.058 * H);
    put(brow, w.hair);
  }

  // Hair sits on the back and top of the skull, leaving the face clear.
  //
  // How clear depends on what is on the front. The hair shell is wider than the
  // skull it sits on, so a cap deep enough to look like hair from behind wraps
  // round far enough to cover the eyes from in front — invisible when the face
  // is two painted dots in the same place, fatal when it is a photograph. So a
  // figure wearing a face decal gets a shallower cap that stops above the brow,
  // and its bulk pushed back behind the plane of the face. The photograph
  // supplies its own hairline anyway.
  if (p.hair > 0) {
    const capTheta = opts.plainFace ? Math.PI * 0.4 : Math.PI * 0.62;
    const cap = new THREE.SphereGeometry(0.072 * H * (1 + 0.3 * p.hair), seg * 2, seg, 0, Math.PI * 2, 0, capTheta);
    cap.scale(opts.plainFace ? 1.02 : 1.06, 0.95, opts.plainFace ? 1.02 : 1.06);
    cap.translate(0, yHead + 0.004 * H, -0.006 * H);
    put(cap, w.hair);
    if (p.hair > 0.5) {
      // Big period hair is a halo wider than the skull. Behind a face decal it
      // has to stay behind and above: pushed back it reads as hair framing the
      // head, but left where it is it closes under the jaw and turns Einstein
      // into a man in a bonnet.
      // Shape matters as much as position here. Flattened and lifted, this
      // sphere presents its underside to a visitor looking up from eye level
      // and reads as the brim of a hat; kept round and pushed back, the same
      // volume reads as a mane standing out behind the head.
      const mass = new THREE.SphereGeometry(0.07 * H * (1 + 0.42 * p.hair), seg, seg);
      mass.scale(1.12, opts.plainFace ? 1.0 : 0.78, opts.plainFace ? 0.75 : 1.0);
      mass.translate(0, yHead + 0.016 * H * p.hair, opts.plainFace ? -0.075 * H : -0.022 * H);
      put(mass, w.hair);
    }
  }

  // ── arms ──
  const spread = 0.34 + p.armSpread * 0.36;
  for (const s of [-1, 1]) {
    const shoulder = new THREE.Vector3(s * shX, yShoulder - 0.012 * H, 0);
    const elbow = new THREE.Vector3(s * (shX + spread * 0.1 * H), yChest - 0.06 * H, 0.005 * H);
    const wrist = new THREE.Vector3(s * (shX + spread * 0.16 * H), yWaist - 0.06 * H, 0.03 * H);
    put(bone(shoulder, elbow, 0.046 * H * limb, seg), armCol);
    put(bone(elbow, wrist, 0.036 * H * limb, seg), w.bareArms ? w.skin : w.skin);
    put(ball(wrist.x, wrist.y - 0.022 * H, wrist.z, 0.036 * H, seg, [0.8, 1.1, 0.7]), w.skin);
  }

  // ── coat or dress ──
  if (p.robe > 0) {
    const skirt = new THREE.CylinderGeometry(0.12 * H * b.torso, 0.12 * H * b.torso * (1 + p.robe), (yWaist - yKnee) * (0.6 + p.robe * 0.5), seg * 2, 1, true);
    skirt.translate(0, yWaist - (yWaist - yKnee) * (0.3 + p.robe * 0.25), 0);
    put(skirt, w.bottom);
  }

  for (const [g, hex] of propGeometry(p.prop, { H, yHead, yWaist, yFoot, shX, spread, seg, limb }, w)) {
    put(g, hex);
  }

  const merged = mergeGeometries(parts, false);
  parts.forEach((g) => g.dispose());
  merged.computeVertexNormals();
  return merged;
}

interface PropCtx {
  H: number;
  yHead: number;
  yWaist: number;
  yFoot: number;
  shX: number;
  spread: number;
  seg: number;
  limb: number;
}

/**
 * The identifying object. One silhouette each — a hat brim, a glove, a ball —
 * because at the distance you first see these figures across the hall, the
 * outline is the only thing carrying who they are.
 */
function propGeometry(
  prop: Prop,
  c: PropCtx,
  w: Wardrobe
): [THREE.BufferGeometry, string][] {
  const { H, yHead, yWaist, yFoot, shX, spread, seg } = c;
  const out: [THREE.BufferGeometry, string][] = [];
  const handX = shX + spread * 0.16 * H;
  const handY = yWaist - 0.085 * H;

  switch (prop) {
    case 'fedora': {
      const brim = new THREE.CylinderGeometry(0.115 * H, 0.125 * H, 0.009 * H, seg * 2);
      brim.translate(0, yHead + 0.054 * H, 0);
      const crown = new THREE.CylinderGeometry(0.058 * H, 0.064 * H, 0.062 * H, seg * 2);
      crown.translate(0, yHead + 0.088 * H, 0);
      out.push([brim, w.accent], [crown, w.accent]);
      // the single white glove, on the right hand
      const glove = new THREE.SphereGeometry(0.04 * H, seg, seg);
      glove.scale(0.85, 1.1, 0.75);
      glove.translate(handX, handY - 0.02 * H, 0.03 * H);
      out.push([glove, '#f4f4f6']);
      break;
    }
    case 'bowler': {
      const brim = new THREE.CylinderGeometry(0.096 * H, 0.104 * H, 0.008 * H, seg * 2);
      brim.translate(0, yHead + 0.052 * H, 0);
      const dome = new THREE.SphereGeometry(0.062 * H, seg * 2, seg, 0, Math.PI * 2, 0, Math.PI / 2);
      dome.scale(1, 0.85, 1);
      dome.translate(0, yHead + 0.052 * H, 0);
      const cane = new THREE.CylinderGeometry(0.006 * H, 0.006 * H, 0.36 * H, 6);
      cane.rotateZ(0.2);
      cane.translate(handX + 0.03 * H, handY - 0.15 * H, 0.04 * H);
      out.push([brim, w.accent], [dome, w.accent], [cane, '#3a2d22']);
      break;
    }
    case 'football': {
      const b = new THREE.SphereGeometry(0.064 * H, seg * 2, seg);
      b.translate(0.1 * H, yFoot + 0.055 * H, 0.12 * H);
      out.push([b, w.accent]);
      break;
    }
    case 'gloves': {
      for (const s of [-1, 1]) {
        const g = new THREE.SphereGeometry(0.052 * H, seg, seg);
        g.scale(0.92, 1.06, 0.92);
        g.translate(s * handX, handY - 0.008 * H, 0.05 * H);
        out.push([g, w.accent]);
      }
      break;
    }
    case 'beard': {
      const beard = new THREE.SphereGeometry(0.058 * H, seg, seg);
      beard.scale(0.88, 1.55, 0.78);
      beard.translate(0, yHead - 0.066 * H, 0.014 * H);
      out.push([beard, w.hair]);
      break;
    }
    case 'device': {
      const d = new THREE.BoxGeometry(0.038 * H, 0.066 * H, 0.009 * H);
      d.rotateX(-0.5);
      d.translate(handX * 0.6, handY + 0.085 * H, 0.09 * H);
      out.push([d, w.accent]);
      break;
    }
    case 'coil': {
      const col = new THREE.CylinderGeometry(0.024 * H, 0.032 * H, 0.32 * H, seg);
      col.translate(0.19 * H, yFoot + 0.16 * H, 0.02 * H);
      const ring = new THREE.TorusGeometry(0.054 * H, 0.013 * H, 6, seg * 2);
      ring.rotateX(Math.PI / 2);
      ring.translate(0.19 * H, yFoot + 0.33 * H, 0.02 * H);
      out.push([col, '#6a6f7a'], [ring, w.accent]);
      break;
    }
    default:
      break;
  }
  return out;
}

/**
 * Casting. Proportion, hair and — above all — the outfit each of them is
 * remembered in: a stage suit and one white glove, a football kit, a black
 * turtleneck, the Tramp's bowler and cane. None of this is a likeness; all of
 * it is recognition.
 */
export const FIGURES: Record<string, HumanoidParams> = {
  'michael-jackson': {
    height: 1.82, build: 'slim', shoulders: 1.02, armSpread: 0.55, hair: 0.6, robe: 0, prop: 'fedora',
    palette: { skin: '#b98a63', hair: '#14100e', top: '#15161c', bottom: '#1b1c24', shoes: '#0d0d11', accent: '#101018' },
  },
  'cristiano-ronaldo': {
    height: 1.92, build: 'athletic', shoulders: 1.14, armSpread: 0.3, hair: 0.22, robe: 0, prop: 'football',
    palette: { skin: '#c08b62', hair: '#1c1410', top: '#b8202e', bottom: '#14532d', shoes: '#f2f3f5', accent: '#f0f1f4', bareLegs: true, bareArms: true },
  },
  'albert-einstein': {
    height: 1.75, build: 'heavy', shoulders: 0.96, armSpread: 0.18, hair: 1.0, robe: 0.25, prop: 'none',
    palette: { skin: '#cfa07e', hair: '#e8e6e2', top: '#4a4741', bottom: '#33302c', shoes: '#221f1c', accent: '#e8e6e2' },
  },
  'leonardo-da-vinci': {
    height: 1.78, build: 'heavy', shoulders: 1.0, armSpread: 0.2, hair: 0.85, robe: 0.85, prop: 'beard',
    palette: { skin: '#cb9d79', hair: '#b9b2a6', top: '#6b2f2a', bottom: '#5a2723', shoes: '#2d211a', accent: '#b9b2a6' },
  },
  'steve-jobs': {
    height: 1.83, build: 'slim', shoulders: 0.94, armSpread: 0.22, hair: 0.3, robe: 0, prop: 'device',
    palette: { skin: '#c99b79', hair: '#d8d6d2', top: '#111216', bottom: '#3f5c86', shoes: '#77787c', accent: '#eceef2' },
  },
  'marilyn-monroe': {
    height: 1.68, build: 'slim', shoulders: 0.86, armSpread: 0.26, hair: 0.85, robe: 0.72, prop: 'none',
    palette: { skin: '#e0b294', hair: '#e8d48a', top: '#f2f0ec', bottom: '#f2f0ec', shoes: '#dcd8d2', accent: '#f2f0ec', bareArms: true },
  },
  'muhammad-ali': {
    height: 1.91, build: 'athletic', shoulders: 1.2, armSpread: 0.42, hair: 0.2, robe: 0, prop: 'gloves',
    palette: { skin: '#7a5237', hair: '#120e0c', top: '#7a5237', bottom: '#f2f2f4', shoes: '#f2f2f4', accent: '#b02a2a', bareArms: true, bareLegs: true },
  },
  'lionel-messi': {
    height: 1.7, build: 'athletic', shoulders: 1.0, armSpread: 0.28, hair: 0.3, robe: 0, prop: 'football',
    palette: { skin: '#cfa079', hair: '#2a1c12', top: '#6cb4e4', bottom: '#1c2b4a', shoes: '#e8e2d0', accent: '#f0f1f4', bareLegs: true, bareArms: true },
  },
  'nikola-tesla': {
    height: 1.88, build: 'slim', shoulders: 0.96, armSpread: 0.16, hair: 0.35, robe: 0.5, prop: 'coil',
    palette: { skin: '#cfa989', hair: '#18140f', top: '#191a20', bottom: '#14151a', shoes: '#0e0e12', accent: '#7ce7ff' },
  },
  'charlie-chaplin': {
    height: 1.65, build: 'slim', shoulders: 0.92, armSpread: 0.48, hair: 0.4, robe: 0, prop: 'bowler',
    palette: { skin: '#d2ae91', hair: '#16120f', top: '#1a1a1e', bottom: '#4e4a44', shoes: '#141416', accent: '#17171b' },
  },
};

export const DEFAULT_FIGURE: HumanoidParams = {
  height: 1.8,
  build: 'athletic',
  shoulders: 1,
  armSpread: 0.3,
  hair: 0.25,
  robe: 0,
  prop: 'none',
  palette: {
    skin: '#c69878', hair: '#1d1713', top: '#2a2d36', bottom: '#1e2027', shoes: '#121317', accent: '#8fa3c8',
  },
};

/**
 * The patch of skull that carries a face.
 *
 * A grid in UV space pushed out onto the head ellipsoid: every vertex keeps the
 * (u, v) it started with, so the photograph lands on the face front-on and
 * undistorted, while the mesh itself curves over the cheekbones. Mapping a
 * photograph through a sphere's own equirectangular UVs instead would smear it
 * sideways, which is the usual reason projected faces look wrong.
 */
export function faceDecalGeometry(p: HumanoidParams): THREE.BufferGeometry {
  const H = p.height;
  const rx = SKULL.r * H * SKULL.scale[0];
  const ry = SKULL.r * H * SKULL.scale[1];
  const rz = SKULL.r * H * SKULL.scale[2];
  // A face occupies the lower part of a skull — the cranium above the hairline
  // is most of the rest — so the patch sits below the head's centre.
  const cy = SKULL.y * H - 0.06 * ry;
  const ax = 0.95 * rx;
  const ay = 0.92 * ry;

  const N = 20;
  const pos: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  for (let j = 0; j <= N; j++) {
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const v = j / N;
      const x = (u - 0.5) * 2 * ax;
      const y = (v - 0.5) * 2 * ay;
      const k = Math.max(0, 1 - (x / rx) * (x / rx) - (y / ry) * (y / ry));
      // a hair proud of the skin, or the two surfaces fight for the same depth
      const z = Math.sqrt(k) * rz * 1.012 + 0.0008 * H;
      pos.push(x, cy + y, SKULL.z * H + z);
      uvs.push(u, v);
    }
  }
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const a = j * (N + 1) + i;
      // counter-clockwise seen from +Z, which is the direction the face
      // looks: wind it the other way and every triangle is back-facing,
      // the whole patch is culled, and the figure silently has no face
      idx.push(a, a + 1, a + N + 1, a + 1, a + N + 2, a + N + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * Characters with a baked face decal in public/portraits/face.
 *
 * Listed explicitly rather than derived from FIGURES: a figure named here is
 * built without its painted eyes, so a missing .webp would leave it with a
 * blank face instead of falling back. Add an id here only once
 * `python tools/bake_faces.py` has produced the file.
 */
export const FACE_DECALS = new Set([
  'albert-einstein',
  'charlie-chaplin',
  'cristiano-ronaldo',
  'leonardo-da-vinci',
  'lionel-messi',
  'marilyn-monroe',
  'michael-jackson',
  'muhammad-ali',
  'nikola-tesla',
  'steve-jobs',
]);
