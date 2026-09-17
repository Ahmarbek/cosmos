import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import type { Station } from './worldLayout';
import { makeLabelTexture } from '../utils/labelTexture';
import { DEFAULT_FIGURE, FACE_DECALS, FIGURES, buildHumanoid, faceDecalGeometry } from './humanoid';
import CharacterModel from './CharacterModel';
import { readStore } from '../state/useStore';
import { useT } from '../i18n';
import { UI } from '../i18n/ui';
import { damp } from '../utils/math';

/**
 * An interactive AI character, represented as a light construct.
 *
 * The body is a lathed humanoid silhouette lit as a hologram — scanlines,
 * fresnel edge, flicker — in the person's two colours. The face is the real
 * thing: the same licensed photograph credited in CREDITS.md, cropped, masked
 * to an oval and projected onto the front of the skull.
 *
 * Which is a deliberate line. A generated photoreal double would be a claim
 * that this is what the person looks like, made up; a documented photograph on
 * an obviously synthetic body, under a plate reading INTERACTIVE AI CHARACTER,
 * claims only what it is. The figure never stops looking like a projection.
 */

/**
 * A soft radial falloff, baked once. A flat disc of colour on the floor reads
 * as a sticker; the same disc with a gradient reads as light.
 */
let glowTex: THREE.CanvasTexture | null = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

const holoVert = /* glsl */ `
  attribute vec3 color;
  varying vec3 vNormalW;
  varying vec3 vWorld;
  varying vec3 vCol;
  varying float vY;
  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vCol = color;
    vY = position.y;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

/**
 * The figure is lit and mostly opaque, so the clothing reads — a black
 * turtleneck has to look like a black turtleneck, and an additively blended
 * silhouette turns everything dark into nothing. The projection quality is
 * carried by the rim, the scan and a soft edge instead.
 */
const holoFrag = /* glsl */ `
  precision mediump float;
  varying vec3 vNormalW;
  varying vec3 vWorld;
  varying vec3 vCol;
  varying float vY;
  uniform vec3  uColorA;
  uniform float uTime;
  uniform float uActive;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vWorld);

    // key from above and in front, plus a cool fill so the dark side is not flat
    vec3 L = normalize(vec3(0.35, 0.92, 0.45));
    float ndl = max(dot(N, L), 0.0);
    float fill = 0.32 + 0.28 * max(dot(N, vec3(-0.4, 0.2, -0.7)), 0.0);
    vec3 lit = vCol * (0.34 + ndl * 0.95 + fill * 0.4);

    // projection rim, in the character's own colour
    float fres = pow(1.0 - abs(dot(N, V)), 2.6);
    // kept low: a body of curved primitives presents grazing angles almost
    // everywhere, so a strong rim floods the whole figure with one colour
    lit += uColorA * fres * (0.18 + uActive * 0.42);

    // horizontal scan, travelling upward
    float scan = sin((vY * 26.0) - uTime * 2.0) * 0.5 + 0.5;
    lit += uColorA * pow(scan, 3.0) * 0.055;

    // occasional dropped line, as if the projection is unstable
    float glitch = step(0.994, hash(floor(vY * 60.0) + floor(uTime * 7.0)));
    lit += vec3(glitch) * 0.35;

    lit *= 0.92 + uActive * 0.42;

    float a = (0.88 + fres * 0.12) * smoothstep(-0.04, 0.07, vY);
    a *= 1.0 - smoothstep(1.75, 2.15, vY) * 0.25;

    gl_FragColor = vec4(lit, clamp(a, 0.0, 1.0));
    #include <colorspace_fragment>
  }
`;


/**
 * The face decal: the person's photograph, lit by the same key, fill and rim as
 * the body so the join at the jaw does not announce itself.
 */
const faceVert = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vWorld;
  varying vec2 vUv;
  varying float vY;
  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vUv = uv;
    vY = position.y;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const faceFrag = /* glsl */ `
  precision mediump float;
  varying vec3 vNormalW;
  varying vec3 vWorld;
  varying vec2 vUv;
  varying float vY;
  uniform sampler2D uMap;
  uniform vec3  uColorA;
  uniform float uTime;
  uniform float uActive;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    if (tex.a < 0.004) discard;

    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vWorld);

    // identical to the body's lighting, deliberately
    vec3 L = normalize(vec3(0.35, 0.92, 0.45));
    float ndl = max(dot(N, L), 0.0);
    float fill = 0.32 + 0.28 * max(dot(N, vec3(-0.4, 0.2, -0.7)), 0.0);
    vec3 lit = tex.rgb * (0.34 + ndl * 0.95 + fill * 0.4);

    float fres = pow(1.0 - abs(dot(N, V)), 2.6);
    lit += uColorA * fres * (0.18 + uActive * 0.42);

    float scan = sin((vY * 26.0) - uTime * 2.0) * 0.5 + 0.5;
    lit += uColorA * pow(scan, 3.0) * 0.055;

    lit *= 0.92 + uActive * 0.42;

    gl_FragColor = vec4(lit, tex.a * (0.9 + fres * 0.1));
    #include <colorspace_fragment>
  }
`;

const faceCache = new Map<string, THREE.Texture>();

function FaceDecal({
  id,
  figure,
  colour,
  time,
  activity,
}: {
  id: string;
  figure: typeof DEFAULT_FIGURE;
  colour: string;
  time: React.MutableRefObject<number>;
  activity: React.MutableRefObject<number>;
}) {
  const [tex, setTex] = useState<THREE.Texture | null>(faceCache.get(id) ?? null);

  useEffect(() => {
    if (tex) return;
    let alive = true;
    new THREE.TextureLoader().load(
      `/portraits/face/${id}.webp`,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        faceCache.set(id, t);
        if (alive) setTex(t);
      },
      undefined,
      // no face is not an error: the figure simply keeps its painted eyes
      () => undefined
    );
    return () => {
      alive = false;
    };
  }, [id, tex]);

  const geometry = useMemo(() => faceDecalGeometry(figure), [figure]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const mat = useMemo(() => {
    if (!tex) return null;
    return new THREE.ShaderMaterial({
      vertexShader: faceVert,
      fragmentShader: faceFrag,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      uniforms: {
        uMap: { value: tex },
        uColorA: { value: new THREE.Color(colour) },
        uTime: { value: 0 },
        uActive: { value: 0 },
      },
    });
  }, [tex, colour]);
  useEffect(() => () => mat?.dispose(), [mat]);

  useFrame(() => {
    if (!mat) return;
    mat.uniforms.uTime.value = time.current;
    mat.uniforms.uActive.value = activity.current;
  });

  if (!mat) return null;
  return <mesh geometry={geometry} material={mat} renderOrder={5} />;
}

export default function Avatar({ station, quality }: { station: Station; quality: string }) {
  const root = useRef<THREE.Group>(null);
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const local = useMemo(() => new THREE.Vector3(), []);
  const active = useRef(0);
  const t = useRef(Math.random() * 10);
  const translate = useT();

  const figure = FIGURES[station.id] ?? DEFAULT_FIGURE;
  const hasFace = FACE_DECALS.has(station.id);
  const geometry = useMemo(
    () => buildHumanoid(figure, quality as 'low' | 'medium' | 'high', { plainFace: hasFace }),
    [figure, quality, hasFace]
  );

  // one merged mesh per figure, so it is disposed as one thing too
  useEffect(() => () => geometry.dispose(), [geometry]);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: holoVert,
        fragmentShader: holoFrag,
        transparent: true,
        depthWrite: true,
        side: THREE.FrontSide,
        uniforms: {
          uColorA: { value: new THREE.Color(station.palette[0]) },
          uTime: { value: 0 },
          uActive: { value: 0 },
        },
      }),
    [station]
  );

  const subtitle = translate(UI.interactiveAiCharacter);
  const label = useMemo(
    () =>
      makeLabelTexture({
        text: station.name,
        sub: subtitle,
        width: 1024,
        height: 256,
      }),
    [station.name, subtitle]
  );
  useEffect(() => () => label.dispose(), [label]);

  useFrame((_, dt) => {
    t.current += dt;
    const s = readStore();
    const isNear = s.worldNear === station.id;
    active.current = damp(active.current, isNear ? 1 : 0, 4, dt);
    mat.uniforms.uTime.value = t.current;
    mat.uniforms.uActive.value = active.current;
    if (group.current) {
      // standing on the plinth, with just enough drift to read as a projection
      group.current.position.y = 0.762 + Math.sin(t.current * 0.7) * 0.018;

      // Turn to face whoever is in front of it. A figure on a slow constant
      // spin shows you its back half the time, which is the opposite of what
      // an exhibit that is about to talk to you should do.
      let want = 0;
      if (root.current) {
        local.copy(camera.position);
        root.current.worldToLocal(local);
        want = Math.atan2(local.x, local.z);
      }
      const cur = group.current.rotation.y;
      let delta = want - cur;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      group.current.rotation.y = cur + delta * (1 - Math.exp(-2.2 * dt));
    }
  });

  return (
    <group ref={root} position={station.position} rotation={[0, station.facing, 0]}>
      {/* plinth */}
      <mesh position={[0, 0.38, 0]} castShadow={false}>
        <cylinderGeometry args={[0.62, 0.76, 0.76, 36]} />
        <meshStandardMaterial
          color="#12141c"
          metalness={0.8}
          roughness={0.3}
          emissive={station.palette[1]}
          emissiveIntensity={0.06}
        />
      </mesh>
      {/* pool of light on the floor, so each station reads from across the hall */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <circleGeometry args={[5, 48]} />
        <meshBasicMaterial
          color={station.palette[0]}
          transparent
          opacity={0.5}
          map={glowTexture()}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0.77, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.44, 0.62, 48]} />
        <meshBasicMaterial color={station.palette[0]} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* The figure: a supplied model if one exists at /models/<id>.glb,
          otherwise the procedural one. Both inherit the float and the facing. */}
      <group ref={group}>
        <Suspense fallback={<mesh geometry={geometry} material={mat} renderOrder={4} />}>
          <CharacterModel id={station.id} height={figure.height} animate={quality !== 'low'}>
            <mesh geometry={geometry} material={mat} renderOrder={4} />
            {hasFace && (
              <FaceDecal
                id={station.id}
                figure={figure}
                colour={station.palette[0]}
                time={t}
                activity={active}
              />
            )}
          </CharacterModel>
        </Suspense>
      </group>

      {/* projection beam — additive, so it can never occlude the figure */}
      <mesh position={[0, 4.4, 0]} renderOrder={2}>
        <cylinderGeometry args={[0.04, 0.8, 6.4, 20, 1, true]} />
        <meshBasicMaterial
          color={station.palette[0]}
          transparent
          opacity={0.016}
          side={THREE.DoubleSide}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* name plate, floating above the figure */}
      <mesh position={[0, 4.05, 0]} renderOrder={6}>
        <planeGeometry args={[4.6, 1.15]} />
        <meshBasicMaterial map={label} transparent depthWrite={false} depthTest={false} opacity={0.95} />
      </mesh>
    </group>
  );
}
